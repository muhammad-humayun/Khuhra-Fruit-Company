namespace BuisnessObject.Chat
{
    /// <summary>
    /// What the server sends back after the AI has answered.
    /// </summary>
    /// <remarks>
    /// Notice what is NOT here: no API key, no exception messages, no stack traces. Anything you
    /// put in this class is visible to anyone using the website, so it only carries what the chat
    /// window actually needs to draw the next bubble.
    /// </remarks>
    public class BOL_ChatReply
    {
        /// <summary>The assistant's answer, ready to show in a chat bubble.</summary>
        public string Reply { get; set; } = string.Empty;

        /// <summary>Echoed back so the browser can confirm which conversation this belongs to.</summary>
        public string SessionId { get; set; } = string.Empty;

        /// <summary>
        /// How many messages are being remembered for this conversation. Handy while learning -
        /// you can watch it grow and then stop at the configured limit.
        /// </summary>
        public int HistoryCount { get; set; }
    }
}
