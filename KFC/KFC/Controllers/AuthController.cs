using System.Net;
using BuisnessLogic.Services;
using BuisnessObject.Auth;
using BuisnessObject.General;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>
    /// Admin registration and sign-in.
    /// </summary>
    /// <remarks>
    /// These two endpoints are deliberately NOT behind [Authorize] - you cannot require a token to
    /// get a token. Registration is instead open only until the first admin exists, and shut after.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Auth _blAuth;

        public AuthController(BL_Auth blAuth)
        {
            _blAuth = blAuth;
        }

        #endregion PropertiesAndConstructors

        /// <summary>
        /// Tells the admin screen whether to offer Register or Login, without revealing anything useful.
        /// </summary>
        [HttpGet("status")]
        [ProducesResponseType(typeof(BOL_ApiResponse<AuthStatusInfo>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<AuthStatusInfo>>> GetStatus()
        {
            return Ok(BOL_ApiResponse<AuthStatusInfo>.Ok(new AuthStatusInfo
            {
                Configured = _blAuth.IsConfigured,
                HasAdmin = await _blAuth.AnyAdminExistsAsync(),
            }));
        }

        /// <summary>Creates the admin account. Works only while no admin exists yet.</summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AuthResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AuthResult>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AuthResult>), StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_AuthResult>>> Register([FromBody] BOL_RegisterRequest request)
        {
            var outcome = await _blAuth.RegisterAsync(request);

            return outcome.Status switch
            {
                AuthStatus.Ok => Ok(BOL_ApiResponse<BOL_AuthResult>.Ok(outcome.Result!, "Account created.")),

                AuthStatus.RegistrationClosed => StatusCode(StatusCodes.Status403Forbidden,
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.Forbidden,
                        "An admin account already exists. Please sign in instead.")),

                AuthStatus.EmailTaken => BadRequest(
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.BadRequest,
                        "An account already exists for that email.")),

                _ => StatusCode(StatusCodes.Status503ServiceUnavailable,
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.ServiceUnavailable,
                        "Sign-in is not configured on the server yet.")),
            };
        }

        /// <summary>Signs in and returns a token for the admin screens.</summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AuthResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AuthResult>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_AuthResult>>> Login([FromBody] BOL_LoginRequest request)
        {
            var outcome = await _blAuth.LoginAsync(request);

            return outcome.Status switch
            {
                AuthStatus.Ok => Ok(BOL_ApiResponse<BOL_AuthResult>.Ok(outcome.Result!, "Signed in.")),

                // One message for both a wrong email and a wrong password, so this cannot be used
                // to discover which email addresses have accounts.
                AuthStatus.InvalidCredentials => Unauthorized(
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.Unauthorized,
                        "Email or password is not correct.")),

                // Only reached once the password has already been checked, so saying the account is
                // switched off tells the real owner something useful without telling a guesser
                // whether the address exists.
                AuthStatus.AccountDisabled => StatusCode(StatusCodes.Status403Forbidden,
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.Forbidden,
                        "This account no longer has access. Ask another admin to restore it.")),

                _ => StatusCode(StatusCodes.Status503ServiceUnavailable,
                    BOL_ApiResponse<BOL_AuthResult>.Fail(HttpStatusCode.ServiceUnavailable,
                        "Sign-in is not configured on the server yet.")),
            };
        }

        public class AuthStatusInfo
        {
            /// <summary>False when the server has no signing key, so sign-in cannot work.</summary>
            public bool Configured { get; set; }

            /// <summary>True once an admin exists, so the screen offers Login rather than Register.</summary>
            public bool HasAdmin { get; set; }
        }
    }
}
