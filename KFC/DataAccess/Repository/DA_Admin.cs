using BuisnessObject.Auth;
using DataAccess.Context;
using Dapper;

namespace DataAccess.Repository
{
    /// <summary>
    /// Admin account reads and writes, through stored procedures like the rest of this solution.
    /// </summary>
    public class DA_Admin
    {
        #region PropertiesAndConstructors

        private readonly DapperWrapper _dapper;

        public DA_Admin(DapperWrapper dapper)
        {
            _dapper = dapper;
        }

        #endregion PropertiesAndConstructors

        /// <summary>How many admins exist. Used to decide whether this is the first-ever account.</summary>
        public async Task<int> CountAsync()
        {
            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Admin_Count");
        }

        public async Task<BOL_Admin?> GetByEmailAsync(string email)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Email", email);

            return await _dapper.QueryFirstOrDefaultAsync<BOL_Admin>("usp_Admin_GetByEmail", paramList);
        }

        public async Task<int> InsertAsync(string email, string passwordHash, string displayName)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Email", email);
            paramList.Add("PasswordHash", passwordHash);
            paramList.Add("DisplayName", displayName);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Admin_Insert", paramList);
        }

        public async Task TouchLoginAsync(int id)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);

            await _dapper.ExecuteAsync("usp_Admin_TouchLogin", paramList);
        }

        #region Admin users

        /// <summary>How many accounts can still sign in.</summary>
        public async Task<int> CountActiveAsync()
        {
            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Admin_CountActive");
        }

        /// <summary>Every admin account, switched-off ones included. Never includes password hashes.</summary>
        public async Task<List<BOL_AdminUser>> GetListAsync()
        {
            return await _dapper.QueryAsync<BOL_AdminUser>("usp_Admin_GetList");
        }

        public async Task<BOL_AdminUser?> GetByIdAsync(int id)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);

            return await _dapper.QueryFirstOrDefaultAsync<BOL_AdminUser>("usp_Admin_GetById", paramList);
        }

        public async Task<int> SetActiveAsync(int id, bool isActive)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);
            paramList.Add("IsActive", isActive);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Admin_SetActive", paramList);
        }

        /// <summary>Stores an already-hashed password. A plain password never reaches here.</summary>
        public async Task<int> SetPasswordAsync(int id, string passwordHash)
        {
            var paramList = new DynamicParameters();
            paramList.Add("Id", id);
            paramList.Add("PasswordHash", passwordHash);

            return await _dapper.QueryFirstOrDefaultAsync<int>("usp_Admin_SetPassword", paramList);
        }

        #endregion Admin users
    }
}
