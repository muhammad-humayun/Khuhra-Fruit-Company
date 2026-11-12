using System;
using System.ComponentModel.DataAnnotations;

namespace BuisnessObject.Catalogue
{
    /// <summary>
    /// A product as the admin screens see it, including items switched off.
    /// </summary>
    public class BOL_ProductAdmin
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategorySlug { get; set; } = string.Empty;
        public string Kind { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string NameSd { get; set; } = string.Empty;
        public string? LocalName { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionSd { get; set; }
        public string? ImageUrl { get; set; }
        public string? SeasonMonths { get; set; }

        /// <summary>The one price the admin edits. Null means "price on request".</summary>
        public decimal? BasePrice { get; set; }

        /// <summary>kg, small, dozen, piece or none - decides the pack sizes customers see.</summary>
        public string PackType { get; set; } = "kg";

        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>What the admin form posts when adding or editing an item.</summary>
    public class BOL_ProductSaveRequest
    {
        /// <summary>
        /// Which group the item belongs to. Send either this or <see cref="CategorySlug"/> - the
        /// admin form sends the slug, because that is what the category dropdown is keyed on.
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>e.g. "stone-fruit". An alternative to <see cref="CategoryId"/>.</summary>
        [StringLength(60)]
        public string? CategorySlug { get; set; }

        [Required]
        [RegularExpression("^(fruit|vegetable)$", ErrorMessage = "Kind must be fruit or vegetable.")]
        public string Kind { get; set; } = string.Empty;

        /// <summary>
        /// Only used when creating. The URL-safe name, e.g. "sweet-lime". It never changes after
        /// creation, because links and basket entries are built from it.
        /// </summary>
        [StringLength(80)]
        [RegularExpression("^[a-z0-9-]*$", ErrorMessage = "Slug may contain only lowercase letters, numbers and dashes.")]
        public string? Slug { get; set; }

        [Required]
        [StringLength(120, MinimumLength = 1)]
        public string NameEn { get; set; } = string.Empty;

        [Required]
        [StringLength(120, MinimumLength = 1)]
        public string NameSd { get; set; } = string.Empty;

        [StringLength(120)]
        public string? LocalName { get; set; }

        [StringLength(600)]
        public string? DescriptionEn { get; set; }

        [StringLength(600)]
        public string? DescriptionSd { get; set; }

        [StringLength(600)]
        [Url(ErrorMessage = "The image must be a full web address starting with http or https.")]
        public string? ImageUrl { get; set; }

        /// <summary>Comma separated month numbers, e.g. "5,6,7,8". Empty means year round.</summary>
        [StringLength(40)]
        [RegularExpression("^[0-9,]*$", ErrorMessage = "Season months must be numbers separated by commas.")]
        public string? SeasonMonths { get; set; }

        [Range(0.01, 9999999, ErrorMessage = "Price must be greater than zero, or left empty for price on request.")]
        public decimal? BasePrice { get; set; }

        [Required]
        [RegularExpression("^(kg|small|dozen|piece|none)$")]
        public string PackType { get; set; } = "kg";

        public bool IsActive { get; set; } = true;

        [Range(0, 9999)]
        public int SortOrder { get; set; } = 50;
    }

    /// <summary>The quick daily edit: change one item's price.</summary>
    public class BOL_PriceUpdateRequest
    {
        [Range(0.01, 9999999, ErrorMessage = "Price must be greater than zero, or left empty for price on request.")]
        public decimal? BasePrice { get; set; }
    }
}
