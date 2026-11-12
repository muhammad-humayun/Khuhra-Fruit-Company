namespace BuisnessLogic.Options
{
    /// <summary>
    /// Settings for admin sign-in, bound from the "Auth" configuration section.
    /// </summary>
    /// <remarks>
    /// SigningKey is a secret and belongs in user secrets or an environment variable, never in
    /// appsettings.json.
    /// </remarks>
    public class AuthOptions
    {
        public const string SectionName = "Auth";

        /// <summary>
        /// The secret the server signs tokens with.
        /// </summary>
        /// <remarks>
        /// This is what makes a token tamper-proof. The server signs each token with this key, so
        /// if someone edits a token to claim they are an admin, the signature stops matching and
        /// the token is rejected. Anyone who learns this key can mint valid tokens, so it is as
        /// sensitive as a password. Minimum 32 characters, because the signing algorithm needs
        /// at least 256 bits.
        /// </remarks>
        public string SigningKey { get; set; } = string.Empty;

        /// <summary>Who issued the token. Checked on every request so tokens from elsewhere are refused.</summary>
        public string Issuer { get; set; } = "KhuhraFruitCompany";

        public string Audience { get; set; } = "KhuhraFruitCompanyAdmin";

        /// <summary>
        /// How long a sign-in lasts. Short enough to limit damage from a stolen token, long enough
        /// that an admin is not retyping their password all day.
        /// </summary>
        public int TokenHours { get; set; } = 8;
    }
}
