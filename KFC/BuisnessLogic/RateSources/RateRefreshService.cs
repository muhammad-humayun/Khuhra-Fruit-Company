using BuisnessLogic.Options;
using BuisnessLogic.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BuisnessLogic.RateSources
{
    /// <summary>
    /// Refreshes stored rates from the configured feed on an interval.
    /// </summary>
    /// <remarks>
    /// When no feed is configured this logs once and stops, costing nothing. It exists so that the day an
    /// authorized Larkana feed becomes available, turning it on is configuration rather than a code change.
    /// </remarks>
    public class RateRefreshService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly RateOptions _options;
        private readonly ILogger<RateRefreshService> _logger;

        public RateRefreshService(
            IServiceScopeFactory scopeFactory,
            IOptions<RateOptions> options,
            ILogger<RateRefreshService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.OfficialFeed.Enabled || string.IsNullOrWhiteSpace(_options.OfficialFeed.Url))
            {
                _logger.LogInformation(
                    "Rate refresh is idle: no authorized rate feed is configured. Rates are served from SQL Server. " +
                    "Set Rates:OfficialFeed:Enabled and Rates:OfficialFeed:Url to turn this on.");
                return;
            }

            var interval = TimeSpan.FromMinutes(Math.Max(5, _options.OfficialFeed.RefreshIntervalMinutes));
            using var timer = new PeriodicTimer(interval);

            do
            {
                await RefreshOnceAsync(stoppingToken);
            }
            while (await WaitAsync(timer, stoppingToken));
        }

        private async Task RefreshOnceAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var blPrice = scope.ServiceProvider.GetRequiredService<BL_Price>();

                var result = await blPrice.RefreshFromOfficialSourceAsync(stoppingToken);

                _logger.LogInformation("Rate refresh finished: {Message}", result.Message);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                // A refresh failure must never take the site down - the stored rates stay as they are.
                _logger.LogError(ex, "Rate refresh failed. Stored rates are unchanged.");
            }
        }

        private static async Task<bool> WaitAsync(PeriodicTimer timer, CancellationToken stoppingToken)
        {
            try
            {
                return await timer.WaitForNextTickAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return false;
            }
        }
    }
}
