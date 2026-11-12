namespace BuisnessLogic.Options
{
    /// <summary>
    /// Every setting the chatbot needs, in one place, read from configuration.
    /// </summary>
    /// <remarks>
    /// This is the "options pattern". Instead of scattering model names and magic numbers through
    /// the code, you declare them once as a class, bind it to a section of appsettings.json in
    /// Program.cs, and inject IOptions&lt;ChatOptions&gt; wherever you need them. Changing the model
    /// then means editing one config value, not hunting through C# files.
    ///
    /// The ApiKey deliberately has NO value here. It comes from .NET User Secrets on your machine
    /// or an environment variable on a server, so the key never sits in a file you might commit.
    /// </remarks>
    public class ChatOptions
    {
        /// <summary>The name of the section in appsettings.json this binds to.</summary>
        public const string SectionName = "Chat";

        /// <summary>
        /// Which OpenAI model to talk to. gpt-4o-mini is cheap, fast and good enough for a
        /// website helper. Change it here, not in the code.
        /// </summary>
        public string Model { get; set; } = "gpt-4o-mini";

        /// <summary>
        /// Your API key. Never put it in appsettings.json - see the README for the
        /// `dotnet user-secrets` command that stores it outside the project folder.
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>
        /// Where to send the requests. Leave empty for OpenAI itself.
        /// </summary>
        /// <remarks>
        /// This is what lets you swap AI providers without touching any code.
        ///
        /// A lot of providers deliberately copy OpenAI's HTTP shape - same URLs, same JSON - so any
        /// client written for OpenAI works against them. They are called "OpenAI-compatible". Point
        /// this at one of them and everything else keeps working:
        ///
        ///   OpenAI      (paid)        leave empty
        ///   Groq        (free tier)   https://api.groq.com/openai/v1
        ///   OpenRouter  (free models) https://openrouter.ai/api/v1
        ///   Ollama      (free, local) http://localhost:11434/v1
        ///
        /// Set the matching Model too, because each provider names its models differently.
        /// </remarks>
        public string BaseUrl { get; set; } = string.Empty;

        /// <summary>
        /// How many past messages to send back to OpenAI with each new question.
        /// </summary>
        /// <remarks>
        /// This is the cost dial. OpenAI charges per token, and you pay for the whole conversation
        /// every single time you ask something, because the model has no memory of its own - you
        /// re-send the history on every call. Keeping 10 means a long chat costs about the same as
        /// a short one. Raise it and the assistant remembers more but each message costs more.
        /// </remarks>
        public int MaxHistoryMessages { get; set; } = 10;

        /// <summary>How long an idle conversation is kept in memory before it is forgotten.</summary>
        public int HistoryMinutes { get; set; } = 30;

        /// <summary>Caps the assistant's answer length, which also caps what each reply costs.</summary>
        public int MaxResponseTokens { get; set; } = 500;

        /// <summary>
        /// 0 = always gives the most predictable answer, 1 = more varied and creative.
        /// A support assistant wants to be consistent, so this sits low.
        /// </summary>
        public double Temperature { get; set; } = 0.4;

        /// <summary>How long to wait for OpenAI before giving up and apologising to the user.</summary>
        public int TimeoutSeconds { get; set; } = 30;

        /// <summary>
        /// The standing instruction given to the model before the conversation starts.
        /// </summary>
        /// <remarks>
        /// This is the single most important setting for behaviour. The model does whatever this
        /// says, so it is where you stop it inventing things. Note what it forbids: the model has
        /// no access to the database, so it is told plainly not to pretend otherwise.
        /// </remarks>
        public string SystemPrompt { get; set; } =
            "You are the assistant on the website of Khuhra Fruit Company, a fruit and vegetable " +
            "commission agent at Sabzi Mandi, Larkana, Sindh, Pakistan. Be brief, warm and practical. " +
            // The answers appear in a narrow chat bubble that renders plain text, so Markdown
            // would show up as literal ** and ### characters. Hence these formatting rules.
            "FORMATTING: reply in plain text only. Never use Markdown - no asterisks for bold, no " +
            "headings, no tables, no backticks. Keep most answers to 2-4 short sentences. Only make " +
            "a list if it genuinely helps; if you do, put each item on its own line starting with " +
            "'- ' and keep each item under about 12 words. " +
            "You may answer general questions about fruits and vegetables, how a mandi commission " +
            "agent works, and how to use this website. " +
            "You do NOT have access to the company's database, live stock or today's prices. If you " +
            "are asked about a current price, availability, or an order, say plainly that you cannot " +
            "see live data and ask the person to send a WhatsApp message to the number on the site. " +
            "Never invent a price, a quantity or a delivery promise. If you do not know, say so. " +
            "If the person writes in Sindhi or Urdu, reply in the same language.";
    }
}
