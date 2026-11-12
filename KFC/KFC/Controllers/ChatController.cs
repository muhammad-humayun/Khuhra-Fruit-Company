using System.Net;
using BuisnessLogic.Services;
using BuisnessObject.Chat;
using BuisnessObject.General;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>
    /// The AI assistant endpoint the chat widget talks to.
    /// </summary>
    /// <remarks>
    /// WHY THIS EXISTS AT ALL, rather than the browser calling OpenAI directly:
    /// the API key. Anything the browser holds, a visitor can read - open DevTools, look at the
    /// network tab, and the key is there to be stolen and billed to you. So the browser talks to
    /// this endpoint, and only this server, which nobody can inspect, holds the key.
    ///
    /// It follows the same shape as the rest of this solution: a thin controller that validates
    /// the request and maps an outcome to an HTTP status code, with the real work in the
    /// BuisnessLogic layer, and every response wrapped in BOL_ApiResponse.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ChatController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Chat _blChat;

        public ChatController(BL_Chat blChat)
        {
            _blChat = blChat;
        }

        #endregion PropertiesAndConstructors

        /// <summary>Sends one message to the assistant and returns its answer.</summary>
        /// <param name="request">The visitor's message plus their conversation id.</param>
        /// <param name="cancellationToken">
        /// Supplied by ASP.NET. It is cancelled if the visitor closes the tab, which lets us stop
        /// waiting on OpenAI instead of paying for an answer nobody will read.
        /// </param>
        [HttpPost]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ChatReply>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ChatReply>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ChatReply>), StatusCodes.Status503ServiceUnavailable)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ChatReply>), StatusCodes.Status504GatewayTimeout)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ChatReply>>> Post(
            [FromBody] BOL_ChatRequest request,
            CancellationToken cancellationToken)
        {
            // [ApiController] has already rejected a missing or over-long message using the
            // annotations on BOL_ChatRequest, so by here the basics are known good. This catches
            // the one thing annotations cannot: a message that is only spaces.
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(BOL_ApiResponse<BOL_ChatReply>.Fail(
                    HttpStatusCode.BadRequest, "Please type a message."));
            }

            var result = await _blChat.AskAsync(request, cancellationToken);

            // Each outcome gets the HTTP status code that honestly describes it, and a message
            // written for a person reading it in a chat bubble - never a raw exception.
            switch (result.Status)
            {
                case ChatStatus.Ok:
                    return Ok(BOL_ApiResponse<BOL_ChatReply>.Ok(result.Reply!));

                case ChatStatus.NotConfigured:
                    return StatusCode(
                        StatusCodes.Status503ServiceUnavailable,
                        BOL_ApiResponse<BOL_ChatReply>.Fail(
                            HttpStatusCode.ServiceUnavailable,
                            "The assistant is not switched on yet. Please use WhatsApp to reach us."));

                case ChatStatus.TimedOut:
                    return StatusCode(
                        StatusCodes.Status504GatewayTimeout,
                        BOL_ApiResponse<BOL_ChatReply>.Fail(
                            HttpStatusCode.GatewayTimeout,
                            "That took too long to answer. Please try again."));

                default:
                    return StatusCode(
                        StatusCodes.Status503ServiceUnavailable,
                        BOL_ApiResponse<BOL_ChatReply>.Fail(
                            HttpStatusCode.ServiceUnavailable,
                            "The assistant could not answer just now. Please try again in a moment."));
            }
        }

        /// <summary>
        /// Says whether the assistant is switched on, without revealing anything about the key.
        /// The chat widget calls this once so it can hide itself when the bot is unavailable.
        /// </summary>
        [HttpGet("status")]
        [ProducesResponseType(typeof(BOL_ApiResponse<ChatStatusInfo>), StatusCodes.Status200OK)]
        public ActionResult<BOL_ApiResponse<ChatStatusInfo>> GetStatus()
        {
            return Ok(BOL_ApiResponse<ChatStatusInfo>.Ok(new ChatStatusInfo
            {
                Available = _blChat.IsConfigured,
            }));
        }

        /// <summary>Whether the assistant can take questions.</summary>
        public class ChatStatusInfo
        {
            public bool Available { get; set; }
        }
    }
}
