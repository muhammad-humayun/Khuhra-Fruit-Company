using BuisnessLogic.Options;
using BuisnessLogic.RateSources;
using BuisnessObject.Pricing;
using DataAccess.Repository;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BuisnessLogic.Services
{
    /// <summary>
    /// Turns stored rate rows into something the site may display.
    /// </summary>
    /// <remarks>
    /// The rules enforced here are the ones that keep the site honest:
    /// a rate older than the freshness window stops counting as a current rate; a rate is only badged
    /// Official if its source said so; units are converted only between mass-based units; and rates from
    /// any market other than the primary one are kept in a separate collection so a template cannot
    /// accidentally present them as local rates.
    /// </remarks>
    public class BL_Price
    {
        #region PropertiesAndConstructors

        private const string BoardCacheKey = "kfc:rates:board";
        private const string BoardCacheKeyIndex = "kfc:rates:board:keys";
        private const string LatestByProductCacheKey = "kfc:rates:latest-by-product";

        private readonly DA_Price _daPrice;
        private readonly IMemoryCache _cache;
        private readonly RateOptions _options;
        private readonly IOfficialRateProvider _rateProvider;
        private readonly ILogger<BL_Price> _logger;

        public BL_Price(
            DA_Price daPrice,
            IMemoryCache cache,
            IOptions<RateOptions> options,
            IOfficialRateProvider rateProvider,
            ILogger<BL_Price> logger)
        {
            _daPrice = daPrice;
            _cache = cache;
            _options = options.Value;
            _rateProvider = rateProvider;
            _logger = logger;
        }

        #endregion PropertiesAndConstructors

        public string PrimaryMarket => _options.PrimaryMarket;

        public int FreshnessWindowDays => _options.FreshnessWindowDays;

        public string RateSourceDescription => _rateProvider.Describe();

        private TimeSpan CacheDuration => TimeSpan.FromSeconds(Math.Max(0, _options.BoardCacheSeconds));

        /// <summary>Today in Pakistan, so a rate is never aged against a server clock in another timezone.</summary>
        public static DateTime MarketToday
        {
            get
            {
                try
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Karachi");
                    return TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, tz).Date;
                }
                catch (Exception ex) when (ex is TimeZoneNotFoundException || ex is InvalidTimeZoneException)
                {
                    return DateTime.Now.Date;
                }
            }
        }

        /// <summary>
        /// Latest resolved rate per product for the primary market, fetched in one round trip and cached,
        /// so rendering a catalogue page never costs one query per card.
        /// </summary>
        public async Task<Dictionary<int, BOL_ProductRate>> GetLatestRatesByProductAsync()
        {
            if (_cache.TryGetValue(LatestByProductCacheKey, out Dictionary<int, BOL_ProductRate>? cached) && cached is not null)
            {
                return cached;
            }

            var rows = await _daPrice.GetLatestPerProductAsync(PrimaryMarket);

            var map = new Dictionary<int, BOL_ProductRate>();
            foreach (var row in rows)
            {
                if (row.ProductId is null)
                {
                    continue;
                }

                map[row.ProductId.Value] = Resolve(row);
            }

            if (CacheDuration > TimeSpan.Zero)
            {
                _cache.Set(LatestByProductCacheKey, map, CacheDuration);
            }

            return map;
        }

        /// <summary>
        /// The public rate board: fresh local rates, expired local rates kept only as history,
        /// and other markets in their own section.
        /// </summary>
        public async Task<BOL_RateBoard> GetRateBoardAsync(string? market = null)
        {
            var marketName = string.IsNullOrWhiteSpace(market) ? PrimaryMarket : market.Trim();
            var cacheKey = $"{BoardCacheKey}:{marketName.ToLowerInvariant()}";

            if (_cache.TryGetValue(cacheKey, out BOL_RateBoard? cached) && cached is not null)
            {
                return cached;
            }

            var primary = await _daPrice.GetLatestPerProductAsync(marketName);
            var others = await _daPrice.GetOtherMarketsAsync(marketName);
            var sources = await _daPrice.GetSourcesAsync();

            foreach (var row in primary)
            {
                Decorate(row);
            }

            foreach (var row in others)
            {
                Decorate(row);
            }

            var fresh = primary.Where(r => r.AgeInDays <= FreshnessWindowDays).ToList();
            var expired = primary.Where(r => r.AgeInDays > FreshnessWindowDays).ToList();

            var board = new BOL_RateBoard
            {
                MarketName = marketName,
                FreshnessWindowDays = FreshnessWindowDays,
                HasPrimaryMarketRates = fresh.Count > 0,
                LastUpdated = fresh.Count > 0 ? fresh.Max(r => r.EffectiveDate) : null,
                PrimaryMarketRates = fresh,
                ExpiredPrimaryMarketRates = expired,
                // Deliberately a separate list. These are never merged into the local board.
                OtherMarketRates = others.Where(r => r.AgeInDays <= FreshnessWindowDays).ToList(),
                Sources = sources
            };

            if (CacheDuration > TimeSpan.Zero)
            {
                _cache.Set(cacheKey, board, CacheDuration);
                TrackBoardCacheKey(cacheKey);
            }

            return board;
        }

        /// <summary>Remembers which per-market board keys are live so they can all be dropped on a write.</summary>
        private void TrackBoardCacheKey(string cacheKey)
        {
            var keys = _cache.GetOrCreate(BoardCacheKeyIndex, _ => new HashSet<string>(StringComparer.OrdinalIgnoreCase))
                       ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            lock (keys)
            {
                keys.Add(cacheKey);
            }

            _cache.Set(BoardCacheKeyIndex, keys);
        }

        /// <summary>Rate history for one product in the primary market, newest first.</summary>
        public async Task<List<BOL_MarketRate>> GetProductRateHistoryAsync(int productId)
        {
            var rows = await _daPrice.GetByProductAsync(productId, PrimaryMarket);

            foreach (var row in rows)
            {
                Decorate(row);
            }

            return rows;
        }

        /// <summary>Applies the display rules to one stored row.</summary>
        public BOL_ProductRate Resolve(BOL_MarketRate? row)
        {
            if (row is null)
            {
                return BOL_ProductRate.NoRate(null, PrimaryMarket);
            }

            Decorate(row);

            var isExpired = row.AgeInDays > FreshnessWindowDays;

            // A row is Official only because its source said so. Anything else is the weaker claim.
            var status = isExpired
                ? BOL_RateStatus.Expired
                : row.IsOfficial && !row.IsManualEntry
                    ? BOL_RateStatus.Official
                    : BOL_RateStatus.Manual;

            return new BOL_ProductRate
            {
                ProductId = row.ProductId,
                Status = status,
                Price = row.Price,
                Currency = row.Currency,
                Unit = row.Unit,
                UnitCode = row.UnitCode,
                PricePerKg = row.PricePerKg,
                PricePerMaund40Kg = row.PricePerMaund40Kg,
                Grade = row.Grade,
                MarketName = row.MarketName,
                PriceType = row.PriceType,
                SourceName = row.SourceName,
                SourceUrl = row.SourceUrl,
                EffectiveDate = row.EffectiveDate,
                RetrievedAt = row.RetrievedAt,
                IsOfficial = row.IsOfficial,
                IsManualEntry = row.IsManualEntry,
                AgeInDays = row.AgeInDays,
                LastKnownLabel = isExpired ? row.CommodityLabel : null
            };
        }

        /// <summary>Fills in the derived fields: normalized unit, age in days and mass-based conversions.</summary>
        private static void Decorate(BOL_MarketRate row)
        {
            row.UnitCode = NormalizeUnit(row.Unit);
            row.AgeInDays = (MarketToday - row.EffectiveDate.Date).Days;

            if (row.UnitCode == BOL_UnitCode.Kg)
            {
                row.PricePerKg = row.Price;
                row.PricePerMaund40Kg = Round(row.Price * BOL_UnitCode.KgPerMaund);
            }
            else if (row.UnitCode == BOL_UnitCode.Maund40Kg)
            {
                row.PricePerKg = Round(row.Price / BOL_UnitCode.KgPerMaund);
                row.PricePerMaund40Kg = row.Price;
            }
            else
            {
                // Dozen and piece have no weight without inventing one, so no conversion is offered.
                row.PricePerKg = null;
                row.PricePerMaund40Kg = null;
            }
        }

        private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

        /// <summary>Maps the many ways a source writes a unit onto a normalized code.</summary>
        public static string NormalizeUnit(string? unit)
        {
            if (string.IsNullOrWhiteSpace(unit))
            {
                return BOL_UnitCode.Unknown;
            }

            var cleaned = new string(unit.Where(c => char.IsLetterOrDigit(c)).ToArray()).ToUpperInvariant();

            switch (cleaned)
            {
                case "KG":
                case "PERKG":
                case "1KG":
                case "KILO":
                case "KILOGRAM":
                case "KILOGRAMME":
                    return BOL_UnitCode.Kg;

                case "40KG":
                case "PER40KG":
                case "MAUND":
                case "MUND":
                case "MN":
                case "PERMAUND":
                    return BOL_UnitCode.Maund40Kg;

                case "DOZEN":
                case "DOZ":
                case "DZ":
                case "PERDOZEN":
                    return BOL_UnitCode.Dozen;

                case "PIECE":
                case "PC":
                case "PCS":
                case "EACH":
                case "NO":
                case "PERPIECE":
                    return BOL_UnitCode.Piece;

                default:
                    return BOL_UnitCode.Unknown;
            }
        }

        /// <summary>
        /// Stores a rate typed in by the business. Forced to IsManualEntry and never Official, so a
        /// hand-entered number can never be presented as a government-notified rate.
        /// </summary>
        public async Task<int> RecordManualRateAsync(BOL_Price price)
        {
            price.IsManualEntry = true;
            price.IsOfficial = false;
            price.RetrievedAt = DateTime.UtcNow;

            if (string.IsNullOrWhiteSpace(price.SourceName))
            {
                price.SourceName = "Entered by Khuhra Fruit Company";
            }

            var id = await _daPrice.UpsertAsync(price);
            InvalidateCache();
            return id;
        }

        /// <summary>
        /// Pulls from the configured feed, if one is configured, and writes what came back.
        /// A missing or failing feed is reported, never papered over with invented numbers.
        /// </summary>
        public async Task<OfficialRateFetchResult> RefreshFromOfficialSourceAsync(CancellationToken cancellationToken)
        {
            if (!_rateProvider.IsEnabled)
            {
                return OfficialRateFetchResult.NotConfigured(_rateProvider.Describe());
            }

            var result = new OfficialRateFetchResult { Attempted = true };

            var rates = await _rateProvider.FetchAsync(cancellationToken);

            if (rates.Count == 0)
            {
                result.Success = false;
                result.Message = "The feed returned no usable rates. Stored rates are unchanged.";
                result.CompletedAt = DateTime.UtcNow;
                return result;
            }

            foreach (var rate in rates)
            {
                try
                {
                    await _daPrice.UpsertAsync(rate);
                    result.RatesWritten++;
                }
                catch (Exception ex)
                {
                    result.RowsSkipped++;
                    _logger.LogWarning(ex, "Could not store the {Commodity} rate for {Market}.", rate.CommodityLabel, rate.MarketName);
                }
            }

            InvalidateCache();

            result.Success = result.RatesWritten > 0;
            result.CompletedAt = DateTime.UtcNow;
            result.Message = $"Stored {result.RatesWritten} rate(s) from {_rateProvider.Describe()}";

            return result;
        }

        public void InvalidateCache()
        {
            _cache.Remove(LatestByProductCacheKey);

            if (_cache.TryGetValue(BoardCacheKeyIndex, out HashSet<string>? keys) && keys is not null)
            {
                lock (keys)
                {
                    foreach (var key in keys)
                    {
                        _cache.Remove(key);
                    }

                    keys.Clear();
                }
            }

            _cache.Remove(BoardCacheKey);
        }
    }
}
