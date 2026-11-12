using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;

namespace BusinessLogic.Context
{
    public class DapperContext
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        public DapperContext(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No connection string named 'DefaultConnection' was found. "
                    + "Add it under the ConnectionStrings section of appsettings.json.");
        }
        public IDbConnection CreateConnection()
            => new SqlConnection(_connectionString);
    }
}
