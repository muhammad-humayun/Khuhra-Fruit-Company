using System.Text.Json;
using System.Text.Json.Serialization;
using BuisnessLogic.Options;
using BuisnessObject.Pricing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BuisnessLogic.RateSources
{
    /// <summary>
    /// Reads rates from whatever authorized feed the operator configures under "Rates:OfficialFeed".
    /// </summary>
    /// <remarks>
    /// There is intentionally no built-in endpoint. The Sindh AMIS portal publishes its daily rates as
    /// HTML on a staging site with no API, no file download and no documented machine-readable endpoint,
    /// so inventing a URL here - or scraping that page - is not something this code does. The provider
    /// therefore stays inert until a real feed address is supplied, and the site runs entirely on
    /// rates stored in SQL Server until then.
    /// <para>Expected response shape - a JSON array of:</para>
    /// <code>
    /// {
    ///   "commodity": "Pomegranate Quetta, Grade 2",
    ///   "market": "Larkana",
    ///   "priceType": "Wholesale",
    ///   "grade": "Grade 2",
    ///   "price": 360,
    ///   "currency": "PKR",
    ///   "unit": "KG",
    ///   "effectiveDate": "2026-10-12",
    ///   "productSlug": "pomegranate"
    /// }
    /// </code>
    /// </remarks>
    public class ConfiguredFeedRateProvider : IOfficialRateProvider
    {
        #region PropertiesAndConstructors

        private readonly HttpClient _httpClient;
        private readonly RateOptions _options;
        private readonly ILogger<ConfiguredFeedRateProvider> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = JsonNumberHandling.AllowReadingFromString
        };

        public ConfiguredFeedRateProvider(
            HttpClient httpClient,
            IOptions<RateOptions> options,
            ILogger<ConfiguredFeedRateProvider> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        #endregion PropertiesAndConstructors

        public bool IsEnabled =>
            _options.OfficialFeed.Enabled && !string.IsNullOrWhiteSpace(_options.OfficialFeed.Url);

        public string Describe()
        {
            if (!_options.OfficialFeed.Enabled)
            {
                return "Disabled. No authorized machine-readable rate feed is configured; rates are served from SQL Server only.";
            }

            if (string.IsNullOrWhiteSpace(_options.OfficialFeed.Url))
            {
                return "Enabled but no Rates:OfficialFeed:Url is set, so nothing is fetched.";
            }

            return $"Enabled against {_options.OfficialFeed.SourceName}, refreshing every {_options.OfficialFeed.RefreshIntervalMinutes} minute(s).";
        }

        public async Task<IReadOnlyList<BOL_Price>> FetchAsync(CancellationToken cancellationToken)
        {
            if (!IsEnabled)
            {
                return Array.Empty<BOL_Price>();
            }

            var feed = _options.OfficialFeed;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, feed.Url);

                if (!string.IsNullOrWhiteSpace(feed.ApiKey))
                {
                    request.Headers.TryAddWithoutValidation(feed.ApiKeyHeader, feed.ApiKey);
                }

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, feed.TimeoutSeconds)));

                using var response = await _httpClient.SendAsync(request, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Rate feed returned {StatusCode}. Keeping the rates already stored in SQL Server.",
                        (int)response.StatusCode);
                    return Array.Empty<BOL_Price>();
                }

                await using var stream = await response.Content.ReadAsStreamAsync(cts.Token);
                var rows = await JsonSerializer.DeserializeAsync<List<FeedRow>>(stream, JsonOptions, cts.Token);

                if (rows is null || rows.Count == 0)
                {
                    _logger.LogInformation("Rate feed returned no rows.");
                    return Array.Empty<BOL_Price>();
                }

                return Map(rows, feed);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Rate feed timed out after {Seconds}s. Stored rates are unchanged.", feed.TimeoutSeconds);
                return Array.Empty<BOL_Price>();
            }
            catch (Exception ex) when (ex is HttpRequestException || ex is JsonException)
            {
                _logger.LogWarning(ex, "Rate feed could not be read. Stored rates are unchanged.");
                return Array.Empty<BOL_Price>();
            }
        }

        private List<BOL_Price> Map(List<FeedRow> rows, OfficialFeedOptions feed)
        {
            var retrievedAt = DateTime.UtcNow;
            var mapped = new List<BOL_Price>(rows.Count);

            foreach (var row in rows)
            {
                // A row without a commodity, a market, a usable price or a date is not guessed at - it is dropped.
                if (string.IsNullOrWhiteSpace(row.Commodity) ||
                    string.IsNullOrWhiteSpace(row.Market) ||
                    row.Price is null || row.Price <= 0m ||
                    row.EffectiveDate is null)
                {
                    continue;
                }

                if (feed.Markets.Count > 0 &&
                    !feed.Markets.Any(m => string.Equals(m, row.Market, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                mapped.Add(new BOL_Price
                {
                    CommodityLabel = row.Commodity!.Trim(),
                    MarketName = row.Market!.Trim(),
                    // Never promoted to Wholesale by assumption - only what the feed states.
                    PriceType = string.IsNullOrWhiteSpace(row.PriceType) ? "Unspecified" : row.PriceType!.Trim(),
                    Grade = string.IsNullOrWhiteSpace(row.Grade) ? null : row.Grade!.Trim(),
                    Price = row.Price.Value,
                    Currency = string.IsNullOrWhiteSpace(row.Currency) ? "PKR" : row.Currency!.Trim(),
                    Unit = string.IsNullOrWhiteSpace(row.Unit) ? "KG" : row.Unit!.Trim(),
                    SourceName = feed.SourceName,
                    SourceUrl = feed.SourceUrl,
                    EffectiveDate = row.EffectiveDate.Value.Date,
                    RetrievedAt = retrievedAt,
                    IsOfficial = feed.TreatAsOfficial,
                    IsManualEntry = false
                });
            }

            return mapped;
        }

        private class FeedRow
        {
            public string? Commodity { get; set; }
            public string? Market { get; set; }
            public string? PriceType { get; set; }
            public string? Grade { get; set; }
            public decimal? Price { get; set; }
            public string? Currency { get; set; }
            public string? Unit { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public string? ProductSlug { get; set; }
        }
    }
}
