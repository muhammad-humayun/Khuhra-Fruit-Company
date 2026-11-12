using BuisnessLogic.Options;
using BuisnessObject.Chat;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace BuisnessLogic.Services
{
    /// <summary>How the attempt to answer went. The controller turns this into an HTTP status code.</summary>
    public enum ChatStatus
    {
        Ok,
        /// <summary>No OpenAI key is configured, so the chatbot is switched off.</summary>
        NotConfigured,
        /// <summary>OpenAI was reached but something went wrong (rate limit, bad key, outage).</summary>
        Failed,
        /// <summary>OpenAI took too long to answer.</summary>
        TimedOut,
    }

    /// <summary>The outcome of one question, plus the answer when there is one.</summary>
    public sealed class ChatResult
    {
        public ChatStatus Status { get; init; }
        public BOL_ChatReply? Reply { get; init; }
    }

    /// <summary>
    /// The chatbot's brain. This is the only place that talks to the AI model.
    /// </summary>
    /// <remarks>
    /// ================== SEMANTIC KERNEL IN PLAIN ENGLISH ==================
    ///
    /// Semantic Kernel (SK) is Microsoft's toolkit for putting AI into a .NET app. You do not
    /// strictly need it to call OpenAI - you could send raw HTTP yourself. What SK buys you:
    ///
    /// 1. <c>IChatCompletionService</c> - an INTERFACE meaning "something I can have a conversation
    ///    with". Our code below only ever talks to this interface. The fact that OpenAI is behind
    ///    it is decided once, in Program.cs. Swap that one line for Azure OpenAI, Google Gemini,
    ///    or a model running on your own machine via Ollama, and this file does not change at all.
    ///    That is the main reason to use SK instead of hand-written HTTP calls.
    ///
    /// 2. <c>ChatHistory</c> - a tidy list of the conversation where every message is tagged with
    ///    who said it: System, User or Assistant. SK converts this into whatever shape the provider
    ///    expects, so you never hand-build JSON.
    ///
    /// 3. <c>PromptExecutionSettings</c> - the per-request dials (how long the answer may be, how
    ///    creative to be).
    ///
    /// THE ONE IDEA THAT SURPRISES EVERYONE: the model has NO memory. Every call is a blank slate.
    /// A conversation only feels continuous because we re-send the previous messages each time.
    /// That is exactly what ChatHistory below is for, and why trimming it controls your bill.
    ///
    /// WHAT WE ARE NOT USING YET (so you know the words):
    /// - "Plugins" / "function calling": you can hand SK your own C# methods and the model may
    ///   choose to call them, e.g. a GetTodaysPrice() that reads your database. That is the step
    ///   that would let this bot answer real stock questions.
    /// - "MCP" (Model Context Protocol): a standard way to expose those tools as a separate
    ///   service so any AI app can use them, not just this one. It is worth adding when you have
    ///   tools worth sharing. Today we have none, so it would be a moving part with nothing to do.
    /// - "RAG": searching your own documents and pasting the relevant bits into the prompt.
    ///   Useful once you have documents worth searching.
    /// ======================================================================
    /// </remarks>
    public class BL_Chat
    {
        #region PropertiesAndConstructors

        /// <summary>
        /// Null when no API key is configured. Asked for with GetService (not GetRequiredService)
        /// on purpose: a missing key must switch the chatbot off, not stop the whole website
        /// from starting.
        /// </summary>
        private readonly IChatCompletionService? _chat;

        private readonly IMemoryCache _cache;
        private readonly ChatOptions _options;
        private readonly ILogger<BL_Chat> _logger;

        public BL_Chat(
            IServiceProvider services,
            IMemoryCache cache,
            IOptions<ChatOptions> options,
            ILogger<BL_Chat> logger)
        {
            _cache = cache;
            _options = options.Value;
            _logger = logger;
            _chat = services.GetService<IChatCompletionService>();
        }

        #endregion PropertiesAndConstructors

        /// <summary>True when an API key was supplied and the bot can actually answer.</summary>
        public bool IsConfigured => _chat is not null;

        /// <summary>
        /// Answers one message, remembering the recent conversation for this session.
        /// </summary>
        public async Task<ChatResult> AskAsync(BOL_ChatRequest request, CancellationToken cancellationToken)
        {
            if (_chat is null)
            {
                return new ChatResult { Status = ChatStatus.NotConfigured };
            }

            // STEP 1 - fetch this conversation, or start a new one.
            // The system message goes in first and stays first. It is the standing instruction
            // that shapes every answer.
            var history = GetHistory(request.SessionId);

            // STEP 2 - add what the person just typed.
            history.AddUserMessage(request.Message.Trim());

            // STEP 3 - forget the oldest messages so the conversation cannot grow forever.
            Trim(history);

            // STEP 4 - the dials for this particular call.
            var settings = new OpenAIPromptExecutionSettings
            {
                MaxTokens = _options.MaxResponseTokens,
                Temperature = _options.Temperature,
            };

            // A timeout of our own, linked to the caller's token so that if the browser gives up
            // (user closed the tab), we stop waiting on OpenAI too and stop paying for it.
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeout.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, _options.TimeoutSeconds)));

            try
            {
                // STEP 5 - the actual call. Everything above was preparation.
                var answer = await _chat.GetChatMessageContentAsync(history, settings, kernel: null, timeout.Token);

                var reply = answer.Content?.Trim();
                if (string.IsNullOrWhiteSpace(reply))
                {
                    _logger.LogWarning("The model returned an empty answer.");
                    return new ChatResult { Status = ChatStatus.Failed };
                }

                // STEP 6 - remember the answer so the next question has context, then save.
                history.AddAssistantMessage(reply);
                Trim(history);
                SaveHistory(request.SessionId, history);

                return new ChatResult
                {
                    Status = ChatStatus.Ok,
                    Reply = new BOL_ChatReply
                    {
                        Reply = reply,
                        SessionId = request.SessionId,
                        HistoryCount = history.Count,
                    },
                };
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                // Our own timeout fired, rather than the browser disconnecting.
                _logger.LogWarning("The model did not answer within {Seconds}s.", _options.TimeoutSeconds);
                return new ChatResult { Status = ChatStatus.TimedOut };
            }
            catch (Exception ex)
            {
                // Catch-all for a bad key, a rate limit, or OpenAI being down. The detail is
                // logged for you and deliberately NOT returned to the browser: error text from an
                // upstream service can leak keys, account ids and internal addresses.
                _logger.LogError(ex, "The chat request to the model failed.");
                return new ChatResult { Status = ChatStatus.Failed };
            }
        }

        #region History

        private string CacheKey(string sessionId) => $"chat:{sessionId}";

        /// <summary>
        /// Loads this session's conversation from memory, or starts a fresh one.
        /// </summary>
        /// <remarks>
        /// IMemoryCache means the history lives in THIS server's RAM. Restart the app and every
        /// conversation is gone; run two servers behind a load balancer and each has its own copy.
        /// That is fine for a chat widget - losing a chat is harmless - but it is the first thing
        /// to change (to Redis, or a database table) if this ever needs to be durable.
        /// </remarks>
        private ChatHistory GetHistory(string sessionId)
        {
            if (_cache.TryGetValue(CacheKey(sessionId), out ChatHistory? existing) && existing is not null)
            {
                return existing;
            }

            var history = new ChatHistory();
            history.AddSystemMessage(_options.SystemPrompt);
            return history;
        }

        private void SaveHistory(string sessionId, ChatHistory history)
        {
            // Sliding expiry: the clock restarts on every message, so an active chat is kept and
            // an abandoned one is dropped automatically. No cleanup code to write.
            _cache.Set(CacheKey(sessionId), history, new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(Math.Max(1, _options.HistoryMinutes)),
            });
        }

        /// <summary>
        /// Keeps the system message plus the most recent N messages, dropping the oldest.
        /// </summary>
        /// <remarks>
        /// The system message is at index 0 and must never be dropped - it is the instruction that
        /// keeps the assistant honest about not having live data. Everything after it is fair game.
        /// </remarks>
        private void Trim(ChatHistory history)
        {
            var keep = Math.Max(2, _options.MaxHistoryMessages);

            // +1 because the system message does not count towards the conversation limit.
            while (history.Count > keep + 1)
            {
                history.RemoveAt(1);
            }
        }

        #endregion History
    }
}
