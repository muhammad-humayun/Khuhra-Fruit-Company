/* =============================================================================
 * PAUSED - Prices API
 *
 * This endpoint belongs to the catalogue/market-rate work that is on hold. It
 * is commented out rather than deleted so nothing is lost: it needs the SQL
 * Server database and stored procedures that have not been written yet, so if
 * it were live it would fail on every call.
 *
 * To bring it back: delete this comment header and the closing marker at the
 * bottom of the file, then re-enable the matching service registrations in
 * Program.cs (they are commented with the same PAUSED note).
 * ========================================================================== */

/*
using BuisnessLogic.Services;
using BuisnessObject.General;
using BuisnessObject.Pricing;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>
    /// Market rates. Every rate returned here carries its market, unit, source and effective date,
    /// so a caller can never render a number without being able to say where it came from.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class PricesController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Price _blPrice;

        public PricesController(BL_Price blPrice)
        {
            _blPrice = blPrice;
        }

        #endregion PropertiesAndConstructors

        /// <summary>
        /// The rate board for a market. Rates from other markets come back in their own collection
        /// and must never be presented as this market's rates.
        /// </summary>
        /// <param name="market">Market name. Defaults to the configured primary market (Larkana).</param>
        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_RateBoard>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_RateBoard>>> Get([FromQuery] string? market)
        {
            var board = await _blPrice.GetRateBoardAsync(market);

            var message = board.HasPrimaryMarketRates
                ? $"{board.PrimaryMarketRates.Count} rate(s) for {board.MarketName}."
                : $"No current official rate is available for {board.MarketName}.";

            return Ok(BOL_ApiResponse<BOL_RateBoard>.Ok(board, message));
        }

        /// <summary>Rate history for one product in the primary market, newest first.</summary>
        [HttpGet("{productId:int}")]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_MarketRate>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_MarketRate>>>> GetByProduct(int productId)
        {
            var rates = await _blPrice.GetProductRateHistoryAsync(productId);

            return Ok(BOL_ApiResponse<List<BOL_MarketRate>>.Ok(rates));
        }

        /// <summary>
        /// Says where rates come from and how long one stays current. Useful for support questions
        /// about why a product shows no rate.
        /// </summary>
        [HttpGet("source")]
        [ProducesResponseType(typeof(BOL_ApiResponse<RateSourceStatus>), StatusCodes.Status200OK)]
        public ActionResult<BOL_ApiResponse<RateSourceStatus>> GetSource()
        {
            var status = new RateSourceStatus
            {
                PrimaryMarket = _blPrice.PrimaryMarket,
                FreshnessWindowDays = _blPrice.FreshnessWindowDays,
                MarketToday = BL_Price.MarketToday,
                FeedStatus = _blPrice.RateSourceDescription
            };

            return Ok(BOL_ApiResponse<RateSourceStatus>.Ok(status));
        }

        /// <summary>Rate-source diagnostics.</summary>
        public class RateSourceStatus
        {
            public string PrimaryMarket { get; set; } = string.Empty;

            public int FreshnessWindowDays { get; set; }

            public DateTime MarketToday { get; set; }

            public string FeedStatus { get; set; } = string.Empty;
        }
    }
}

*/
