namespace BuisnessObject.Catalogue
{
    /// <summary>
    /// A catalogue grouping (e.g. "Stone Fruit", "Leafy Vegetables") inside a <see cref="Kind"/>.
    /// </summary>
    public class BOL_Category
    {
        public int Id { get; set; }

        /// <summary>"fruit" or "vegetable".</summary>
        public string Kind { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string NameSd { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public int ProductCount { get; set; }
    }
}
