//using BusinessObject.General;
using BusinessLogic.Context;
using Dapper;
using System.Data;

namespace DataAccess.Context
{
    public class DapperWrapper
    {
        #region PropertiesAndConstructors

        private readonly DapperContext _context;

        public DapperWrapper(DapperContext context)
        {
            _context = context;
        }

        #endregion PropertiesAndConstructors

        public async Task<List<T>> QueryAsync<T>(string spName, DynamicParameters paramList)
        {
            using (var con = _context.CreateConnection())
            {
                var response = await con.QueryAsync<T>(sql: spName, commandType: CommandType.StoredProcedure, param: paramList);
                return response.ToList();
            }
        }

        public async Task<List<T>> QueryAsync<T>(string spName)
        {
            using (var con = _context.CreateConnection())
            {
                var response = await con.QueryAsync<T>(sql: spName, commandType: CommandType.StoredProcedure);
                return response.ToList();
            }
        }

        //public async Task<PagedListResponse<T>> QueryPagedAsync<T>(string spName, DynamicParameters paramList)
        //{
        //    PagedListResponse<T> response;
        //    using (var con = _context.CreateConnection())
        //    {
        //        paramList.Add("RecordCount", DbType.Int32, direction: ParameterDirection.Output);
        //        IEnumerable<T> list = await con.QueryAsync<T>(sql: spName, commandType: CommandType.StoredProcedure, param: paramList);
        //        int recordCount = paramList.Get<int>("RecordCount");
        //        response = new PagedListResponse<T>(list, recordCount);
        //    }
        //    return response;
        //}

        public async Task<T?> QueryFirstOrDefaultAsync<T>(string spName, DynamicParameters paramList)
        {
            using (var con = _context.CreateConnection())
            {
                return await con.QueryFirstOrDefaultAsync<T>(sql: spName, commandType: CommandType.StoredProcedure, param: paramList);
            }
        }

        public async Task<T?> QueryFirstOrDefaultAsync<T>(string spName)
        {
            using (var con = _context.CreateConnection())
            {
                return await con.QueryFirstOrDefaultAsync<T>(sql: spName, commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<int> ExecuteAsync(string spName, DynamicParameters paramList)
        {
            using (var con = _context.CreateConnection())
            {
                return await con.ExecuteAsync(sql: spName, commandType: CommandType.StoredProcedure, param: paramList);
            }
        }
    }
}