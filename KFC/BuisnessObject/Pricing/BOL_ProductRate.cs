using System;

namespace BuisnessObject.Pricing
{
    /// <summary>
    /// A rate resolved for display against one product, including the "no usable rate" case.
    /// </summary>
    public class BOL_ProductRate
    {
        public int? ProductId { get; set; }

        /// <summary>One of the <see cref="BOL_RateStatus"/> values.</summary>
        public string Status { get; set; } = BOL_RateStatus.Unavailable;

        /// <summary>True only when a price may be shown as a current rate.</summary>
        public bool HasPrice => Status == BOL_RateStatus.Official || Status == BOL_RateStatus.Manual;

        public decimal? Price { get; set; }

        public string Currency { get; set; } = "PKR";

        /// <summary>Unit as published by the source.</summary>
        public string? Unit { get; set; }

        /// <summary>Normalized unit code, one of the <see cref="BOL_UnitCode"/> values.</summary>
        public string UnitCode { get; set; } = BOL_UnitCode.Unknown;

        /// <summary>Set only for mass-based units. Null for dozen and piece.</summary>
        public decimal? PricePerKg { get; set; }

        /// <summary>Set only for mass-based units. One maund is 40 KG.</summary>
        public decimal? PricePerMaund40Kg { get; set; }

        public string? Grade { get; set; }

        public string? MarketName { get; set; }

        public string PriceType { get; set; } = "Wholesale";

        public string? SourceName { get; set; }

        public string? SourceUrl { get; set; }

        public DateTime? EffectiveDate { get; set; }

        public DateTime? RetrievedAt { get; set; }

        public bool IsOfficial { get; set; }

        public bool IsManualEntry { get; set; }

        /// <summary>Whole days between <see cref="EffectiveDate"/> and today.</summary>
        public int? AgeInDays { get; set; }

        /// <summary>
        /// Populated for <see cref="BOL_RateStatus.Expired"/>: a label for the stale observation, so the UI can show
        /// "last recorded rate" next to the unavailable message without presenting it as a current rate.
        /// </summary>
        public string? LastKnownLabel { get; set; }

        public static BOL_ProductRate NoRate(int? productId, string? marketName) => new BOL_ProductRate
        {
            ProductId = productId,
            MarketName = marketName,
            Status = BOL_RateStatus.Unavailable
        };
    }
}
