namespace BuisnessObject.Pricing
{
    /// <summary>
    /// How a displayed rate must be presented. The frontend badges each case differently and
    /// must never render a <see cref="Manual"/> rate as a government-notified rate.
    /// </summary>
    public static class BOL_RateStatus
    {
        /// <summary>A rate traceable to an official market-committee / AMIS publication, inside the freshness window.</summary>
        public const string Official = "Official";

        /// <summary>A rate entered by the business. Honest, but not government-notified.</summary>
        public const string Manual = "Manual";

        /// <summary>A rate exists but is older than the freshness window. It must never be presented as a current rate.</summary>
        public const string Expired = "Expired";

        /// <summary>No rate has ever been recorded for this product in this market.</summary>
        public const string Unavailable = "Unavailable";
    }

    /// <summary>
    /// Normalized unit codes. Mass-based units convert between each other; count-based units never do,
    /// because converting a dozen or a piece to a weight would require inventing a produce weight.
    /// </summary>
    public static class BOL_UnitCode
    {
        public const string Kg = "KG";
        public const string Maund40Kg = "40KG";
        public const string Dozen = "DOZEN";
        public const string Piece = "PIECE";
        public const string Unknown = "UNKNOWN";

        /// <summary>Kilograms in one maund as used in Pakistani produce markets.</summary>
        public const int KgPerMaund = 40;

        public static bool IsMassBased(string? unitCode) => unitCode == Kg || unitCode == Maund40Kg;
    }
}
