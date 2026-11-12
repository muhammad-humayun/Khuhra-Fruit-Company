using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace BuisnessObject.General
{
    public class BOL_ApiResponse<T>
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static BOL_ApiResponse<T> Ok(T data, string message = "Success") => new BOL_ApiResponse<T>
        {
            StatusCode = HttpStatusCode.OK,
            Message = message,
            Data = data
        };

        public static BOL_ApiResponse<T> Fail(HttpStatusCode statusCode, string message) => new BOL_ApiResponse<T>
        {
            StatusCode = statusCode,
            Message = message,
            Data = default
        };
    }
}
