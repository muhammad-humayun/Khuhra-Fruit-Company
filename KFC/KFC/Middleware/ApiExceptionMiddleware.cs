using System.Net;
using System.Text.Json;
using BuisnessObject.General;

namespace KFC.Middleware
{
    /// <summary>
    /// Turns an unhandled exception into the same <see cref="BOL_ApiResponse{T}"/> envelope the
    /// controllers return, so the Angular client only ever has one response shape to parse.
    /// Details are logged server-side and never sent to the browser.
    /// </summary>
    public class ApiExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiExceptionMiddleware> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

                if (context.Response.HasStarted)
                {
                    throw;
                }

                context.Response.Clear();
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var payload = BOL_ApiResponse<object>.Fail(
                    HttpStatusCode.InternalServerError,
                    "Something went wrong handling this request. Please try again.");

                await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
            }
        }
    }

    public static class ApiExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseApiExceptionHandling(this IApplicationBuilder app)
            => app.UseMiddleware<ApiExceptionMiddleware>();
    }
}
