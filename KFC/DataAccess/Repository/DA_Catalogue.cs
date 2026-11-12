using BuisnessObject.Catalogue;
using DataAccess.Context;
using Dapper;

namespace DataAccess.Repository
{
    /// <summary>
    /// Catalogue reads and writes. Every call goes through <see cref="DapperWrapper"/> into a
    /// stored procedure, matching the data-access pattern already used in this solution.
    /// </summary>
    public class DA_Catalogue
    {
        #region PropertiesAndConstructors

        private readonly DapperWrapper _dapper;

        public DA_Catalogue(DapperWrapper dapper)
        {
            _dapper = dapper;
        }

        #endregion PropertiesAndConstructors

        #region Public reads

        public async Task<List<BOL_Category>> GetCategoriesAsync(string? kind)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Kind", kind);

            return await _dapper.QueryAsync<BOL_Category>("usp_Category_GetList", paramList);
        }

        /// <summary>Active products only - what the shop shows.</summary>
        public async Task<List<BOL_Product>> GetProductsAsync(string? kind)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Kind", kind);

            return await _dapper.QueryAsync<BOL_Product>("usp_Product_GetList", paramList);
        }

        #endregion Public reads

        #region Admin

        /// <summary>Everything, including switched-off items.</summary>
        public async Task<List<BOL_ProductAdmin>> GetAllForAdminAsync()
        {
            return await _dapper.QueryAsync<BOL_ProductAdmin>("usp_Product_GetAll");
        }

        public async Task<BOL_ProductAdmin?> GetByIdAsync(int id)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);

            return await _dapper.QueryFirstOrDefaultAsync<BOL_ProductAdmin>("usp_Product_GetById", paramList);
        }

        public async Task<int> InsertAsync(BOL_ProductSaveRequest request, string slug, int categoryId)
        {
            var paramList = BuildSaveParams(request, categoryId);
            paramList.Add("Slug", slug);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Product_Insert", paramList);
        }

        public async Task<int> UpdateAsync(int id, BOL_ProductSaveRequest request, int categoryId)
        {
            var paramList = BuildSaveParams(request, categoryId);
            paramList.Add("Id", id);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Product_Update", paramList);
        }

        public async Task<int> UpdatePriceAsync(int id, decimal? basePrice)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);
            paramList.Add("BasePrice", basePrice);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Product_UpdatePrice", paramList);
        }

        public async Task<int> SetActiveAsync(int id, bool isActive)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);
            paramList.Add("IsActive", isActive);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Product_SetActive", paramList);
        }

        /// <summary>The parameters shared by insert and update, named to match the procedures.</summary>
        private static DynamicParameters BuildSaveParams(BOL_ProductSaveRequest r, int categoryId)
        {
            var paramList = new DynamicParameters();
            paramList.Add("CategoryId", categoryId);
            paramList.Add("Kind", r.Kind);
            paramList.Add("NameEn", r.NameEn);
            paramList.Add("NameSd", r.NameSd);
            paramList.Add("LocalName", r.LocalName);
            paramList.Add("DescriptionEn", r.DescriptionEn);
            paramList.Add("DescriptionSd", r.DescriptionSd);
            paramList.Add("ImageUrl", r.ImageUrl);
            paramList.Add("SeasonMonths", r.SeasonMonths);
            paramList.Add("BasePrice", r.BasePrice);
            paramList.Add("PackType", r.PackType);
            paramList.Add("IsActive", r.IsActive);
            paramList.Add("SortOrder", r.SortOrder);
            return paramList;
        }

        #endregion Admin
    }
}
