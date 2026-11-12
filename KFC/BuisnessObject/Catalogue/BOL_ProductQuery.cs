namespace BuisnessObject.Catalogue
{
    /// <summary>Filter arguments for the catalogue listing endpoint.</summary>
    public class BOL_ProductQuery
    {
        /// <summary>"fruit" or "vegetable". Null returns both.</summary>
        public string? Category { get; set; }

        /// <summary>Category slug filter, e.g. "citrus".</summary>
        public string? Group { get; set; }

        /// <summary>Free-text search across English, Sindhi and local names.</summary>
        public string? Search { get; set; }

        /// <summary>Restrict to products whose typical season covers this month (1-12).</summary>
        public int? Month { get; set; }

        /// <summary>Restrict to products the business has confirmed.</summary>
        public bool ConfirmedOnly { get; set; }

        /// <summary>Restrict to products that have a usable (non-expired) rate.</summary>
        public bool WithRateOnly { get; set; }
    }
}
