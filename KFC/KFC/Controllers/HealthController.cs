/* =============================================================================
 * PAUSED - Health API
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
using System.Net;
using BuisnessObject.General;
using BusinessLogic.Context;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>Liveness and database connectivity, for deployment checks.</summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class HealthController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly DapperContext _context;
        private readonly ILogger<HealthController> _logger;

        public HealthController(DapperContext context, ILogger<HealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        #endregion PropertiesAndConstructors

        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<HealthStatus>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<HealthStatus>), StatusCodes.Status503ServiceUnavailable)]
        public async Task<ActionResult<BOL_ApiResponse<HealthStatus>>> Get()
        {
            var status = new HealthStatus { Api = "up" };

            try
            {
                using var connection = _context.CreateConnection();
                var result = await connection.ExecuteScalarAsync<int>("SELECT 1");
                status.Database = result == 1 ? "up" : "unexpected response";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed.");
                status.Database = "down";

                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    BOL_ApiResponse<HealthStatus>.Fail(HttpStatusCode.ServiceUnavailable, "The database is unreachable."));
            }

            return Ok(BOL_ApiResponse<HealthStatus>.Ok(status));
        }

        public class HealthStatus
        {
            public string Api { get; set; } = string.Empty;

            public string Database { get; set; } = string.Empty;

            public DateTime CheckedAtUtc { get; set; } = DateTime.UtcNow;
        }
    }
}

*/
