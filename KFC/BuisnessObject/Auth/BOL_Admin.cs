using System;
using System.ComponentModel.DataAnnotations;

namespace BuisnessObject.Auth
{
    /// <summary>
    /// An admin row as stored. <see cref="PasswordHash"/> never leaves the server.
    /// </summary>
    public class BOL_Admin
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// The one-way hash of the password, never the password itself. If this database were
        /// stolen, these cannot be turned back into passwords.
        /// </summary>
        public string PasswordHash { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        /// <summary>False once access has been withdrawn. A switched-off account cannot sign in.</summary>
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// An admin user as the Users screen sees them.
    /// </summary>
    /// <remarks>
    /// Note what is missing: PasswordHash. It is not here, it is not selected by the list procedure,
    /// and so it cannot leak into the browser through this screen.
    /// </remarks>
    public class BOL_AdminUser
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>What a signed-in admin posts to add another admin user.</summary>
    public class BOL_AdminUserCreateRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(120, MinimumLength = 2)]
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Eight characters minimum. Whoever creates the account chooses the first password and
        /// passes it on; the new user can change it once they are in.
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>Changing your own password.</summary>
    public class BOL_PasswordChangeRequest
    {
        /// <summary>
        /// Proves it is really you. Without it, anyone who found an unattended signed-in screen
        /// could lock the real owner out by changing the password.
        /// </summary>
        [Required]
        [StringLength(100)]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; } = string.Empty;
    }

    /// <summary>What the browser posts to create the first admin account.</summary>
    public class BOL_RegisterRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Eight characters minimum. Short passwords are the single easiest way into a system.
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(120, MinimumLength = 2)]
        public string DisplayName { get; set; } = string.Empty;
    }

    /// <summary>What the browser posts to sign in.</summary>
    public class BOL_LoginRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>What the server returns after a successful sign-in.</summary>
    public class BOL_AuthResult
    {
        /// <summary>
        /// The signed token the browser sends back on every admin request. It carries who you are
        /// and when it expires, and it is signed, so it cannot be edited without the server noticing.
        /// </summary>
        public string Token { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
    }
}
