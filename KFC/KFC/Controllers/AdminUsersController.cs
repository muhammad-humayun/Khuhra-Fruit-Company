using System.Net;
using System.Security.Claims;
using BuisnessLogic.Services;
using BuisnessObject.Auth;
using BuisnessObject.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace KFC.Controllers
{
    /// <summary>
    /// Admin accounts: who can get into the shop setup screens.
    /// </summary>
    /// <remarks>
    /// Everything here is behind [Authorize], so only someone already signed in as an admin can add
    /// or remove another. That is what replaced the old public registration form - creating an admin
    /// is now something an admin does, not something a stranger who finds the page can do.
    ///
    /// All admins are equal: anyone created here can in turn create and remove others. There are no
    /// lesser roles yet.
    /// </remarks>
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class AdminUsersController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Auth _blAuth;

        public AdminUsersController(BL_Auth blAuth)
        {
            _blAuth = blAuth;
        }

        #endregion PropertiesAndConstructors

        /// <summary>
        /// Who the request is coming from, taken from the signed token.
        /// </summary>
        /// <remarks>
        /// Read from the token, never from the request body. The token is signed, so this cannot be
        /// faked; a value posted by the browser could be anything the sender typed. This is what
        /// makes "you cannot switch off your own account" a real rule rather than a suggestion.
        /// </remarks>
        private int ActingAdminId =>
            int.TryParse(
                User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var id)
                ? id
                : 0;

        /// <summary>Every admin account, switched-off ones included.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_AdminUser>>>> GetAll()
        {
            var users = await _blAuth.GetUsersAsync();

            return Ok(BOL_ApiResponse<List<BOL_AdminUser>>.Ok(users));
        }

        /// <summary>Tells the screen which row is the signed-in admin's own.</summary>
        [HttpGet("me")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AdminUser>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_AdminUser>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_AdminUser>>> GetMe()
        {
            var me = (await _blAuth.GetUsersAsync()).FirstOrDefault(u => u.Id == ActingAdminId);

            return me is null
                ? NotFound(BOL_ApiResponse<BOL_AdminUser>.Fail(HttpStatusCode.NotFound, "Account not found."))
                : Ok(BOL_ApiResponse<BOL_AdminUser>.Ok(me));
        }

        /// <summary>Adds another admin user.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_AdminUser>>>> Create(
            [FromBody] BOL_AdminUserCreateRequest request)
        {
            var status = await _blAuth.CreateUserAsync(request);

            if (status == AuthStatus.EmailTaken)
            {
                return BadRequest(BOL_ApiResponse<List<BOL_AdminUser>>.Fail(
                    HttpStatusCode.BadRequest,
                    "An account already exists for that email."));
            }

            return Ok(BOL_ApiResponse<List<BOL_AdminUser>>.Ok(
                await _blAuth.GetUsersAsync(),
                $"{request.DisplayName.Trim()} can now sign in. Pass them the password yourself - it is not stored anywhere readable."));
        }

        /// <summary>Switches an admin account on or off.</summary>
        [HttpPut("{id:int}/active")]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_AdminUser>>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_AdminUser>>>> SetActive(
            int id,
            [FromQuery] bool isActive)
        {
            var status = await _blAuth.SetUserActiveAsync(id, isActive, ActingAdminId);

            return status switch
            {
                AuthStatus.Ok => Ok(BOL_ApiResponse<List<BOL_AdminUser>>.Ok(
                    await _blAuth.GetUsersAsync(),
                    isActive ? "Access restored." : "Access removed.")),

                AuthStatus.UserNotFound => NotFound(BOL_ApiResponse<List<BOL_AdminUser>>.Fail(
                    HttpStatusCode.NotFound, "That account does not exist.")),

                AuthStatus.CannotDisableSelf => BadRequest(BOL_ApiResponse<List<BOL_AdminUser>>.Fail(
                    HttpStatusCode.BadRequest,
                    "You cannot remove your own access. Ask another admin to do it.")),

                AuthStatus.WouldLockEveryoneOut => BadRequest(BOL_ApiResponse<List<BOL_AdminUser>>.Fail(
                    HttpStatusCode.BadRequest,
                    "This is the only account that can still sign in. Add another admin first.")),

                _ => BadRequest(BOL_ApiResponse<List<BOL_AdminUser>>.Fail(
                    HttpStatusCode.BadRequest, "That could not be changed.")),
            };
        }

        /// <summary>Changes the signed-in admin's own password.</summary>
        [HttpPut("me/password")]
        [ProducesResponseType(typeof(BOL_ApiResponse<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BOL_ApiResponse<string>>> ChangeOwnPassword(
            [FromBody] BOL_PasswordChangeRequest request)
        {
            var status = await _blAuth.ChangeOwnPasswordAsync(ActingAdminId, request);

            return status switch
            {
                AuthStatus.Ok => Ok(BOL_ApiResponse<string>.Ok(string.Empty, "Password changed.")),

                AuthStatus.InvalidCredentials => BadRequest(BOL_ApiResponse<string>.Fail(
                    HttpStatusCode.BadRequest, "Your current password is not correct.")),

                _ => BadRequest(BOL_ApiResponse<string>.Fail(
                    HttpStatusCode.BadRequest, "The password could not be changed.")),
            };
        }
    }
}
