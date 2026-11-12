using System.ComponentModel.DataAnnotations;

namespace BuisnessObject.Chat
{
    /// <summary>
    /// What the browser sends when someone types a message.
    /// </summary>
    /// <remarks>
    /// The attributes below ([Required], [StringLength]) are "data annotations". Because the
    /// controller is marked [ApiController], ASP.NET checks them automatically before your code
    /// runs, and sends back a 400 Bad Request if they fail. You never have to write that check
    /// yourself. This is what stops someone pasting a million characters into the box and running
    /// up your OpenAI bill.
    /// </remarks>
    public class BOL_ChatRequest
    {
        /// <summary>
        /// Identifies one browser tab's conversation so follow-up questions make sense.
        /// The browser makes this up (a random id) and sends the same one every time.
        /// </summary>
        [Required]
        [StringLength(64, MinimumLength = 8)]
        public string SessionId { get; set; } = string.Empty;

        /// <summary>The person's message. Capped so one request cannot be enormous.</summary>
        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Message { get; set; } = string.Empty;
    }
}
