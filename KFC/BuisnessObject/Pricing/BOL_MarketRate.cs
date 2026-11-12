using System;
using System.Collections.Generic;

namespace BuisnessObject.Pricing
{
    /// <summary>A single rate row for the rate board, carrying its own market, source and date.</summary>
    public class BOL_MarketRate
    {
        public int Id { get; set; }

        public int? ProductId { get; set; }

        public string? ProductSlug { get; set; }

        /// <summary>The commodity string exactly as the source published it.</summary>
        public string CommodityLabel { get; set; } = string.Empty;

        public string MarketName { get; set; } = string.Empty;

        public string PriceType { get; set; } = "Wholesale";

        public string? Grade { get; set; }

        public decimal Price { get; set; }

        public string Currency { get; set; } = "PKR";

        public string Unit { get; set; } = "KG";

        public string UnitCode { get; set; } = BOL_UnitCode.Unknown;

        public decimal? PricePerKg { get; set; }

        public decimal? PricePerMaund40Kg { get; set; }

        public string SourceName { get; set; } = string.Empty;

        public string? SourceUrl { get; set; }

        public DateTime EffectiveDate { get; set; }

        public DateTime RetrievedAt { get; set; }

        public bool IsOfficial { get; set; }

        public bool IsManualEntry { get; set; }

        public int AgeInDays { get; set; }
    }

    /// <summary>
    /// The rate board for the primary market, plus a strictly separate section for other markets.
    /// Other-market rates are never merged into <see cref="PrimaryMarketRates"/>.
    /// </summary>
    public class BOL_RateBoard
    {
        public string MarketName { get; set; } = string.Empty;

        /// <summary>True when at least one usable rate exists for <see cref="MarketName"/>.</summary>
        public bool HasPrimaryMarketRates { get; set; }

        /// <summary>Most recent effective date present in <see cref="PrimaryMarketRates"/>.</summary>
        public DateTime? LastUpdated { get; set; }

        /// <summary>Days a rate stays displayable as current before it becomes Expired.</summary>
        public int FreshnessWindowDays { get; set; }

        public List<BOL_MarketRate> PrimaryMarketRates { get; set; } = new List<BOL_MarketRate>();

        /// <summary>Rates from other markets. Must never be presented as <see cref="MarketName"/> rates.</summary>
        public List<BOL_MarketRate> OtherMarketRates { get; set; } = new List<BOL_MarketRate>();

        /// <summary>Rates held but older than the freshness window, shown only as historical context.</summary>
        public List<BOL_MarketRate> ExpiredPrimaryMarketRates { get; set; } = new List<BOL_MarketRate>();

        public List<BOL_RateSourceInfo> Sources { get; set; } = new List<BOL_RateSourceInfo>();
    }

    /// <summary>Provenance summary so the UI can always name where its numbers came from.</summary>
    public class BOL_RateSourceInfo
    {
        public string SourceName { get; set; } = string.Empty;

        public string? SourceUrl { get; set; }

        public bool IsOfficial { get; set; }

        public DateTime? LatestEffectiveDate { get; set; }

        public int RateCount { get; set; }
    }
}
