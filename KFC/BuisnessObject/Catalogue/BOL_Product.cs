namespace BuisnessObject.Catalogue
{
    /// <summary>
    /// A product as the public website sees it.
    /// </summary>
    /// <remarks>
    /// This mirrors what usp_Product_GetList returns, so Dapper can map a row straight onto it
    /// with no hand-written assignment code.
    ///
    /// Note what is here instead of a list of pack prices: one <see cref="BasePrice"/> and a
    /// <see cref="PackType"/>. The pack sizes a customer picks from (1 kg / 5 kg / 40 kg, or
    /// 250 g / 500 g / 1 kg, or dozens, or pieces) are worked out from those two values. That way
    /// an admin changes one number and every pack size follows, instead of editing three prices
    /// and risking them drifting out of step.
    /// </remarks>
    public class BOL_Product
    {
        public int Id { get; set; }

        /// <summary>"fruit" or "vegetable".</summary>
        public string Kind { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;

        public string NameEn { get; set; } = string.Empty;
        public string NameSd { get; set; } = string.Empty;

        /// <summary>Transliterated local name, e.g. "Aam", "Khajoor".</summary>
        public string? LocalName { get; set; }

        public string? DescriptionEn { get; set; }
        public string? DescriptionSd { get; set; }

        public string? ImageUrl { get; set; }

        /// <summary>Comma separated month numbers, e.g. "5,6,7,8". Empty means traded year round.</summary>
        public string? SeasonMonths { get; set; }

        /// <summary>Price of the smallest pack. Null means the card shows "price on request".</summary>
        public decimal? BasePrice { get; set; }

        /// <summary>kg, small, dozen, piece or none.</summary>
        public string PackType { get; set; } = "kg";

        public bool IsActive { get; set; }

        public int SortOrder { get; set; }
    }
}
