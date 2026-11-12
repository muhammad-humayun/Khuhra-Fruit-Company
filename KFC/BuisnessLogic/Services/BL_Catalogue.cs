using BuisnessObject.Catalogue;
using DataAccess.Repository;

namespace BuisnessLogic.Services
{
    /// <summary>What happened when saving an item.</summary>
    public enum SaveStatus
    {
        Ok,
        NotFound,
        /// <summary>Another product already uses that slug.</summary>
        SlugTaken,
        /// <summary>No category matched the id or slug that was sent.</summary>
        CategoryNotFound,
        /// <summary>A fruit was filed under a vegetable group, or the other way round.</summary>
        CategoryKindMismatch,
    }

    public sealed class SaveOutcome
    {
        public SaveStatus Status { get; init; }
        public int Id { get; init; }
    }

    /// <summary>
    /// Serves the catalogue to the public site and handles admin edits.
    /// </summary>
    public class BL_Catalogue
    {
        #region PropertiesAndConstructors

        private readonly DA_Catalogue _daCatalogue;

        public BL_Catalogue(DA_Catalogue daCatalogue)
        {
            _daCatalogue = daCatalogue;
        }

        #endregion PropertiesAndConstructors

        #region Public

        public async Task<List<BOL_Category>> GetCategoriesAsync(string? kind)
        {
            return await _daCatalogue.GetCategoriesAsync(NormalizeKind(kind));
        }

        public async Task<List<BOL_Product>> GetProductsAsync(string? kind)
        {
            return await _daCatalogue.GetProductsAsync(NormalizeKind(kind));
        }

        #endregion Public

        #region Admin

        public async Task<List<BOL_ProductAdmin>> GetAllForAdminAsync()
        {
            return await _daCatalogue.GetAllForAdminAsync();
        }

        public async Task<BOL_ProductAdmin?> GetByIdAsync(int id)
        {
            return await _daCatalogue.GetByIdAsync(id);
        }

        public async Task<SaveOutcome> CreateAsync(BOL_ProductSaveRequest request)
        {
            var resolved = await ResolveCategoryAsync(request);
            if (resolved.Status != SaveStatus.Ok)
            {
                return new SaveOutcome { Status = resolved.Status };
            }

            // A slug is the item's address in a URL and the key the basket stores, so it has to be
            // unique and URL-safe. If the admin did not supply one, build it from the English name.
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.NameEn) : request.Slug.Trim();

            var existing = await _daCatalogue.GetAllForAdminAsync();
            if (existing.Any(p => string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase)))
            {
                return new SaveOutcome { Status = SaveStatus.SlugTaken };
            }

            var id = await _daCatalogue.InsertAsync(request, slug, resolved.Id);
            return new SaveOutcome { Status = SaveStatus.Ok, Id = id };
        }

        public async Task<SaveOutcome> UpdateAsync(int id, BOL_ProductSaveRequest request)
        {
            var resolved = await ResolveCategoryAsync(request);
            if (resolved.Status != SaveStatus.Ok)
            {
                return new SaveOutcome { Status = resolved.Status };
            }

            var rows = await _daCatalogue.UpdateAsync(id, request, resolved.Id);

            return rows > 0
                ? new SaveOutcome { Status = SaveStatus.Ok, Id = id }
                : new SaveOutcome { Status = SaveStatus.NotFound };
        }

        /// <summary>
        /// Turns whichever of CategoryId / CategorySlug the form sent into a real category id.
        /// </summary>
        /// <remarks>
        /// This check exists so a wrong category produces a clear "that group does not exist"
        /// message. Without it the bad value reaches SQL Server, the foreign key rejects it, and the
        /// admin sees an unexplained server error instead.
        /// </remarks>
        private async Task<SaveOutcome> ResolveCategoryAsync(BOL_ProductSaveRequest request)
        {
            var categories = await _daCatalogue.GetCategoriesAsync(null);

            BOL_Category? match = null;

            if (request.CategoryId is > 0)
            {
                match = categories.FirstOrDefault(c => c.Id == request.CategoryId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(request.CategorySlug))
            {
                match = categories.FirstOrDefault(c =>
                    string.Equals(c.Slug, request.CategorySlug.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            if (match is null)
            {
                return new SaveOutcome { Status = SaveStatus.CategoryNotFound };
            }

            // Stops a mango being filed under Leafy Greens. The shop filters by Kind but groups by
            // category, so a mismatch would make the item appear in a group it does not belong to.
            if (!string.Equals(match.Kind, NormalizeKind(request.Kind), StringComparison.OrdinalIgnoreCase))
            {
                return new SaveOutcome { Status = SaveStatus.CategoryKindMismatch };
            }

            return new SaveOutcome { Status = SaveStatus.Ok, Id = match.Id };
        }

        public async Task<bool> UpdatePriceAsync(int id, decimal? basePrice)
        {
            return await _daCatalogue.UpdatePriceAsync(id, basePrice) > 0;
        }

        public async Task<bool> SetActiveAsync(int id, bool isActive)
        {
            return await _daCatalogue.SetActiveAsync(id, isActive) > 0;
        }

        #endregion Admin

        /// <summary>Turns "Sweet Lime" into "sweet-lime".</summary>
        public static string Slugify(string name)
        {
            var cleaned = new string(name.ToLowerInvariant()
                .Select(c => char.IsLetterOrDigit(c) ? c : '-')
                .ToArray());

            while (cleaned.Contains("--"))
            {
                cleaned = cleaned.Replace("--", "-");
            }

            return cleaned.Trim('-');
        }

        /// <summary>Accepts the singular and plural spellings the routes use.</summary>
        private static string? NormalizeKind(string? kind)
        {
            if (string.IsNullOrWhiteSpace(kind))
            {
                return null;
            }

            return kind.Trim().ToLowerInvariant() switch
            {
                "fruit" or "fruits" => "fruit",
                "vegetable" or "vegetables" or "veg" => "vegetable",
                _ => kind.Trim().ToLowerInvariant(),
            };
        }
    }
}
