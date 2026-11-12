using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BuisnessLogic.Options;
using BuisnessObject.Auth;
using DataAccess.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BuisnessLogic.Services
{
    public enum AuthStatus
    {
        Ok,
        /// <summary>Email or password did not match. Deliberately not more specific - see below.</summary>
        InvalidCredentials,
        /// <summary>An admin already exists, so registration is closed.</summary>
        RegistrationClosed,
        /// <summary>That email already has an account.</summary>
        EmailTaken,
        /// <summary>No signing key configured, so sign-in cannot work safely.</summary>
        NotConfigured,
        /// <summary>The account exists but has been switched off.</summary>
        AccountDisabled,
        /// <summary>That admin user does not exist.</summary>
        UserNotFound,
        /// <summary>Refused because it would leave nobody able to sign in.</summary>
        WouldLockEveryoneOut,
        /// <summary>You cannot switch off your own account.</summary>
        CannotDisableSelf,
    }

    public sealed class AuthOutcome
    {
        public AuthStatus Status { get; init; }
        public BOL_AuthResult? Result { get; init; }
    }

    /// <summary>
    /// Admin registration and sign-in.
    /// </summary>
    /// <remarks>
    /// Three security ideas worth understanding here:
    ///
    /// 1. PASSWORDS ARE HASHED, NEVER STORED. <see cref="PasswordHasher{TUser}"/> turns a password
    ///    into a long one-way string. You cannot reverse it. To check a password we hash the
    ///    attempt and compare, so even we never learn what the password is. It also salts each
    ///    hash, so two people with the same password get different stored values.
    ///
    /// 2. THE SAME ERROR FOR BOTH FAILURES. A wrong email and a wrong password both return
    ///    InvalidCredentials. If we said "no such user", an attacker could discover which email
    ///    addresses have accounts just by trying them.
    ///
    /// 3. REGISTRATION IS FIRST-RUN ONLY. Anyone can reach the register endpoint - it cannot be
    ///    behind [Authorize], because you cannot require a token in order to get your first one.
    ///    So it is open only until the first admin exists, and refuses from then on. That window
    ///    is the one moment a stranger could take the account, which is why you should create
    ///    yours straight after setting the site up rather than leaving it for later.
    /// </remarks>
    public class BL_Auth
    {
        #region PropertiesAndConstructors

        private readonly DA_Admin _daAdmin;
        private readonly AuthOptions _options;
        private readonly ILogger<BL_Auth> _logger;

        /// <summary>
        /// The generic type argument is only a label here; we are using the hashing algorithm, not
        /// the rest of ASP.NET Identity (which would drag in Entity Framework and clash with the
        /// Dapper pattern this solution uses).
        /// </summary>
        private readonly PasswordHasher<string> _hasher = new PasswordHasher<string>();

        public BL_Auth(DA_Admin daAdmin, IOptions<AuthOptions> options, ILogger<BL_Auth> logger)
        {
            _daAdmin = daAdmin;
            _options = options.Value;
            _logger = logger;
        }

        #endregion PropertiesAndConstructors

        /// <summary>True when a signing key long enough to be safe has been configured.</summary>
        public bool IsConfigured => _options.SigningKey.Length >= 32;

        /// <summary>True once at least one admin exists, so the UI can show Login instead of Register.</summary>
        public async Task<bool> AnyAdminExistsAsync() => await _daAdmin.CountAsync() > 0;

        public async Task<AuthOutcome> RegisterAsync(BOL_RegisterRequest request)
        {
            if (!IsConfigured)
            {
                return new AuthOutcome { Status = AuthStatus.NotConfigured };
            }

            // The gate. Once an account exists this endpoint is shut, so it cannot be used to add
            // a second admin later. Checked on the server, where it cannot be bypassed - the
            // browser hiding the form would be no protection at all.
            if (await AnyAdminExistsAsync())
            {
                _logger.LogWarning(
                    "Admin registration refused for {Email}: an admin account already exists.",
                    request.Email);

                return new AuthOutcome { Status = AuthStatus.RegistrationClosed };
            }

            var email = request.Email.Trim().ToLowerInvariant();

            if (await _daAdmin.GetByEmailAsync(email) is not null)
            {
                return new AuthOutcome { Status = AuthStatus.EmailTaken };
            }

            var hash = _hasher.HashPassword(email, request.Password);
            var id = await _daAdmin.InsertAsync(email, hash, request.DisplayName.Trim());

            _logger.LogInformation("Admin account created for {Email}.", email);

            return new AuthOutcome
            {
                Status = AuthStatus.Ok,
                Result = IssueToken(id, email, request.DisplayName.Trim()),
            };
        }

        public async Task<AuthOutcome> LoginAsync(BOL_LoginRequest request)
        {
            if (!IsConfigured)
            {
                return new AuthOutcome { Status = AuthStatus.NotConfigured };
            }

            var email = request.Email.Trim().ToLowerInvariant();
            var admin = await _daAdmin.GetByEmailAsync(email);

            if (admin is null)
            {
                // Same answer as a wrong password, on purpose - see the class remarks.
                return new AuthOutcome { Status = AuthStatus.InvalidCredentials };
            }

            var verdict = _hasher.VerifyHashedPassword(email, admin.PasswordHash, request.Password);

            if (verdict == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Failed sign-in attempt for {Email}.", email);
                return new AuthOutcome { Status = AuthStatus.InvalidCredentials };
            }

            // Checked after the password on purpose. Refusing earlier would tell someone holding a
            // wrong password that the address is a real, switched-off account.
            if (!admin.IsActive)
            {
                _logger.LogWarning("Sign-in refused for {Email}: the account is switched off.", email);
                return new AuthOutcome { Status = AuthStatus.AccountDisabled };
            }

            await _daAdmin.TouchLoginAsync(admin.Id);

            return new AuthOutcome
            {
                Status = AuthStatus.Ok,
                Result = IssueToken(admin.Id, admin.Email, admin.DisplayName),
            };
        }

        #region Admin users

        /// <summary>Every admin account, for the Users screen.</summary>
        public async Task<List<BOL_AdminUser>> GetUsersAsync() => await _daAdmin.GetListAsync();

        /// <summary>
        /// Creates another admin account. Only ever called by an already signed-in admin.
        /// </summary>
        /// <remarks>
        /// Every admin created here has exactly the same powers as the one who created them,
        /// including the power to add and remove other admins. There are no lesser roles yet, so
        /// only hand this out to people you would trust with your prices.
        /// </remarks>
        public async Task<AuthStatus> CreateUserAsync(BOL_AdminUserCreateRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            if (await _daAdmin.GetByEmailAsync(email) is not null)
            {
                return AuthStatus.EmailTaken;
            }

            // The password is hashed here and the plain one is never stored, so not even you can
            // read it back afterwards - it has to be passed to the new user some other way.
            var hash = _hasher.HashPassword(email, request.Password);
            await _daAdmin.InsertAsync(email, hash, request.DisplayName.Trim());

            _logger.LogInformation("Admin user {Email} created.", email);

            return AuthStatus.Ok;
        }

        /// <summary>
        /// Switches an admin account on or off.
        /// </summary>
        /// <remarks>
        /// Two refusals here exist purely to stop the admin locking themselves out, which is not
        /// recoverable from the screens - it would need someone editing the database by hand.
        /// </remarks>
        public async Task<AuthStatus> SetUserActiveAsync(int id, bool isActive, int actingAdminId)
        {
            var user = await _daAdmin.GetByIdAsync(id);

            if (user is null)
            {
                return AuthStatus.UserNotFound;
            }

            if (!isActive)
            {
                if (id == actingAdminId)
                {
                    return AuthStatus.CannotDisableSelf;
                }

                if (user.IsActive && await _daAdmin.CountActiveAsync() <= 1)
                {
                    return AuthStatus.WouldLockEveryoneOut;
                }
            }

            await _daAdmin.SetActiveAsync(id, isActive);

            _logger.LogInformation(
                "Admin user {Email} switched {State}.", user.Email, isActive ? "on" : "off");

            return AuthStatus.Ok;
        }

        /// <summary>Changes your own password, after proving you know the current one.</summary>
        public async Task<AuthStatus> ChangeOwnPasswordAsync(int adminId, BOL_PasswordChangeRequest request)
        {
            var user = await _daAdmin.GetByIdAsync(adminId);

            if (user is null)
            {
                return AuthStatus.UserNotFound;
            }

            var admin = await _daAdmin.GetByEmailAsync(user.Email);

            if (admin is null ||
                _hasher.VerifyHashedPassword(admin.Email, admin.PasswordHash, request.CurrentPassword)
                    == PasswordVerificationResult.Failed)
            {
                return AuthStatus.InvalidCredentials;
            }

            await _daAdmin.SetPasswordAsync(adminId, _hasher.HashPassword(admin.Email, request.NewPassword));

            _logger.LogInformation("Password changed for {Email}.", admin.Email);

            return AuthStatus.Ok;
        }

        #endregion Admin users

        /// <summary>
        /// Builds the signed token the browser will send back on every admin request.
        /// </summary>
        /// <remarks>
        /// A JWT is three parts: who you are (claims), when it expires, and a signature over both.
        /// It is signed, NOT encrypted - anyone can read the contents, so never put anything
        /// secret in it. What it guarantees is that nobody edited it.
        /// </remarks>
        private BOL_AuthResult IssueToken(int id, string email, string displayName)
        {
            var expires = DateTime.UtcNow.AddHours(Math.Max(1, _options.TokenHours));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Name, displayName),
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            return new BOL_AuthResult
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Email = email,
                DisplayName = displayName,
                ExpiresAtUtc = expires,
            };
        }
    }
}
