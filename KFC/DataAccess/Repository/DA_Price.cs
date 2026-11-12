using BuisnessObject.Pricing;
using DataAccess.Context;
using Dapper;

namespace DataAccess.Repository
{
    /// <summary>
    /// Rate reads and writes. Returns rows exactly as stored, with provenance intact;
    /// freshness and unit normalization are applied in the business layer, not here.
    /// </summary>
    public class DA_Price
    {
        #region PropertiesAndConstructors

        private readonly DapperWrapper _dapper;

        public DA_Price(DapperWrapper dapper)
        {
            _dapper = dapper;
        }

        #endregion PropertiesAndConstructors

        /// <summary>
        /// The newest rate per product for one market, in a single round trip,
        /// so a catalogue page never queries per card.
        /// </summary>
        public async Task<List<BOL_MarketRate>> GetLatestPerProductAsync(string marketName)
        {
            var paramList = new DynamicParameters();
            paramList.Add("MarketName", marketName);

            return await _dapper.QueryAsync<BOL_MarketRate>("usp_Price_GetLatestPerProduct", paramList);
        }

        /// <summary>Full rate history for one product, newest first.</summary>
        public async Task<List<BOL_MarketRate>> GetByProductAsync(int productId, string? marketName)
        {
            var paramList = new DynamicParameters();
            paramList.Add("ProductId", productId);
            paramList.Add("MarketName", marketName);

            return await _dapper.QueryAsync<BOL_MarketRate>("usp_Price_GetByProduct", paramList);
        }

        /// <summary>Newest rate per commodity for every market except the excluded one.</summary>
        public async Task<List<BOL_MarketRate>> GetOtherMarketsAsync(string excludeMarketName)
        {
            var paramList = new DynamicParameters();
            paramList.Add("ExcludeMarketName", excludeMarketName);

            return await _dapper.QueryAsync<BOL_MarketRate>("usp_Price_GetOtherMarkets", paramList);
        }

        public async Task<List<BOL_RateSourceInfo>> GetSourcesAsync()
        {
            return await _dapper.QueryAsync<BOL_RateSourceInfo>("usp_Price_GetSources");
        }

        /// <summary>
        /// Inserts a rate, or updates the existing row for the same product, market, price type,
        /// grade and effective date. Returns the affected row id.
        /// </summary>
        public async Task<int> UpsertAsync(BOL_Price price)
        {
            var paramList = new DynamicParameters();
            paramList.Add("ProductId", price.ProductId);
            paramList.Add("CommodityLabel", price.CommodityLabel);
            paramList.Add("MarketName", price.MarketName);
            paramList.Add("PriceType", price.PriceType);
            paramList.Add("Grade", price.Grade);
            paramList.Add("Price", price.Price);
            paramList.Add("Currency", price.Currency);
            paramList.Add("Unit", price.Unit);
            paramList.Add("SourceName", price.SourceName);
            paramList.Add("SourceUrl", price.SourceUrl);
            paramList.Add("EffectiveDate", price.EffectiveDate);
            paramList.Add("RetrievedAt", price.RetrievedAt);
            paramList.Add("IsOfficial", price.IsOfficial);
            paramList.Add("IsManualEntry", price.IsManualEntry);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Price_Upsert", paramList);
        }
    }
}
