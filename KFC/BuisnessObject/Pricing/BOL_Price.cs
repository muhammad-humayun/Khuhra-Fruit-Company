using System;

namespace BuisnessObject.Pricing
{
    /// <summary>
    /// One recorded rate observation, mirroring the Prices table.
    /// Every row carries its own provenance, so a rate can never be displayed without its source and date.
    /// </summary>
    public class BOL_Price
    {
        public int Id { get; set; }

        /// <summary>Null for rates from other markets that are not mapped onto a catalogue product.</summary>
        public int? ProductId { get; set; }

        /// <summary>The commodity string exactly as the source published it, e.g. "Pomegranate Quetta, Grade 2".</summary>
        public string CommodityLabel { get; set; } = string.Empty;

        public string MarketName { get; set; } = string.Empty;

        /// <summary>"Wholesale" or "Retail". Never inferred - only ever what the source itself states.</summary>
        public string PriceType { get; set; } = "Wholesale";

        public string? Grade { get; set; }

        /// <summary>Monetary value. Decimal throughout - never float or double.</summary>
        public decimal Price { get; set; }

        public string Currency { get; set; } = "PKR";

        /// <summary>Unit exactly as published, e.g. "KG".</summary>
        public string Unit { get; set; } = "KG";

        public string SourceName { get; set; } = string.Empty;

        public string? SourceUrl { get; set; }

        /// <summary>The date the rate applies to, as stated by the source.</summary>
        public DateTime EffectiveDate { get; set; }

        /// <summary>When this row was captured.</summary>
        public DateTime RetrievedAt { get; set; }

        /// <summary>True only for rates traceable to an official publication.</summary>
        public bool IsOfficial { get; set; }

        /// <summary>True when a person typed this rate in rather than it arriving from a source feed.</summary>
        public bool IsManualEntry { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
