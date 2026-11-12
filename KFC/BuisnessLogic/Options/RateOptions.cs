namespace BuisnessLogic.Options
{
    /// <summary>Rate behaviour, bound from the "Rates" configuration section.</summary>
    public class RateOptions
    {
        public const string SectionName = "Rates";

        /// <summary>The market this site speaks for. Rates from any other market are shown separately.</summary>
        public string PrimaryMarket { get; set; } = "Larkana";

        /// <summary>
        /// How many days a rate stays displayable as current. Past this it becomes Expired and the
        /// site shows the "contact us for today's rate" fallback instead.
        /// </summary>
        public int FreshnessWindowDays { get; set; } = 2;

        /// <summary>Server-side cache lifetime for the rate board, in seconds.</summary>
        public int BoardCacheSeconds { get; set; } = 120;

        public OfficialFeedOptions OfficialFeed { get; set; } = new OfficialFeedOptions();
    }

    /// <summary>
    /// An authorized machine-readable rate feed.
    /// <para>
    /// Disabled by default and deliberately URL-less: as of this build the Sindh AMIS portal
    /// publishes no API, no downloadable feed and no documented machine-readable endpoint, so there is
    /// no address to point at. When an authorized feed becomes available, set Enabled and Url here;
    /// no code change is required. Credentials stay on the server and are never sent to the browser.
    /// </para>
    /// </summary>
    public class OfficialFeedOptions
    {
        public bool Enabled { get; set; }

        /// <summary>Absolute URL of an authorized feed returning the documented JSON array shape.</summary>
        public string? Url { get; set; }

        /// <summary>Optional credential, held server-side only.</summary>
        public string? ApiKey { get; set; }

        public string ApiKeyHeader { get; set; } = "X-Api-Key";

        /// <summary>Human-readable attribution recorded against every rate this feed supplies.</summary>
        public string SourceName { get; set; } = "Configured official feed";

        public string? SourceUrl { get; set; }

        /// <summary>
        /// Whether rates from this feed may be badged Official. Set false for any feed that is not an
        /// official market-committee publication.
        /// </summary>
        public bool TreatAsOfficial { get; set; } = true;

        /// <summary>Markets to keep from the feed response. Empty keeps every market.</summary>
        public List<string> Markets { get; set; } = new List<string>();

        public int RefreshIntervalMinutes { get; set; } = 180;

        public int TimeoutSeconds { get; set; } = 20;
    }
}
