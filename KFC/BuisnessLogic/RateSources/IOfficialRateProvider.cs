using BuisnessObject.Pricing;

namespace BuisnessLogic.RateSources
{
    /// <summary>
    /// Supplies rates from an external authorized source.
    /// </summary>
    public interface IOfficialRateProvider
    {
        /// <summary>False when no authorized feed has been configured, in which case nothing is fetched.</summary>
        bool IsEnabled { get; }

        /// <summary>Short description used in logs and the diagnostics endpoint.</summary>
        string Describe();

        /// <summary>
        /// Fetches the current rate set. Returns an empty list rather than throwing when the source is
        /// unreachable or returns nothing usable, so a feed outage never takes the site down.
        /// </summary>
        Task<IReadOnlyList<BOL_Price>> FetchAsync(CancellationToken cancellationToken);
    }

    /// <summary>Outcome of one refresh attempt.</summary>
    public class OfficialRateFetchResult
    {
        public bool Attempted { get; set; }

        public bool Success { get; set; }

        public int RatesWritten { get; set; }

        public int RowsSkipped { get; set; }

        public string Message { get; set; } = string.Empty;

        public DateTime? CompletedAt { get; set; }

        public static OfficialRateFetchResult NotConfigured(string message) => new OfficialRateFetchResult
        {
            Attempted = false,
            Success = false,
            Message = message,
            CompletedAt = DateTime.UtcNow
        };
    }
}
