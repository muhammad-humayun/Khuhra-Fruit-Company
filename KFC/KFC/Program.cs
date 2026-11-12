using System.Reflection;
using System.Text;
using BuisnessLogic.Options;
using BuisnessLogic.Services;
using BusinessLogic.Context;
using DataAccess.Context;
using DataAccess.Repository;
using KFC.Middleware;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.SemanticKernel;
using OpenAI;
using System.ClientModel;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Khuhra Fruit Company API",
        Version = "v1",
        Description = "Khuhra Fruit Company API. Currently serving the AI assistant endpoint."
    });

    // Adds the "Authorize" button to the Swagger page, so the admin endpoints can be tried out:
    // sign in via /api/auth/login, copy the token from the response, paste it in here once.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only the token itself - Swagger adds the \"Bearer \" prefix for you.",
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Needed by the chatbot to remember each visitor's recent conversation.
builder.Services.AddMemoryCache();

// =============================================================================
// Data access and catalogue
// =============================================================================

// The Dapper + stored procedure pattern used throughout this solution.
builder.Services.AddScoped<DapperContext>();
builder.Services.AddScoped<DapperWrapper>();
builder.Services.AddScoped<DA_Catalogue>();
builder.Services.AddScoped<DA_Admin>();

builder.Services.AddScoped<BL_Catalogue>();
builder.Services.AddScoped<BL_Auth>();

/* The market-rate feed stays paused - it belongs to the AMIS work, not the shop.
builder.Services.Configure<RateOptions>(builder.Configuration.GetSection(RateOptions.SectionName));
builder.Services.AddScoped<DA_Price>();
builder.Services.AddScoped<BL_Price>();
builder.Services.AddHttpClient<IOfficialRateProvider, ConfiguredFeedRateProvider>();
builder.Services.AddHostedService<RateRefreshService>();
*/

// =============================================================================
// Admin sign-in (JWT)
// =============================================================================

builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));

// The signing key is a secret and belongs in user secrets or an environment variable, never in
// appsettings.json: it is what makes a token impossible to forge.
var signingKey = builder.Configuration["Auth:SigningKey"];

if (!string.IsNullOrWhiteSpace(signingKey) && signingKey.Length >= 32)
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            // Every one of these checks matters. Turning any of them off would let a token that
            // was issued elsewhere, or has expired, be accepted as valid.
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Auth:Issuer"] ?? "KhuhraFruitCompany",
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Auth:Audience"] ?? "KhuhraFruitCompanyAdmin",
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                // No grace period on expiry beyond a few seconds of clock drift.
                ClockSkew = TimeSpan.FromSeconds(30),
            };

            // ---------------------------------------------------------------
            // Making "remove access" mean it immediately.
            //
            // A token is self-contained: the server can check it is genuine and unexpired without
            // looking anything up. That is what makes tokens fast, but it also means switching an
            // admin off in the database would NOT stop the token they are already holding - it
            // would keep working for up to eight hours.
            //
            // So on every request we also check the account is still switched on. It costs one
            // small lookup per admin request, which is nothing at this scale, and it turns
            // "Remove access" from "they stop being able to sign in again" into "they are out now".
            // ---------------------------------------------------------------
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    var id = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                             ?? context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                    if (!int.TryParse(id, out var adminId))
                    {
                        context.Fail("Token carries no admin id.");
                        return;
                    }

                    var admins = context.HttpContext.RequestServices.GetRequiredService<DA_Admin>();
                    var admin = await admins.GetByIdAsync(adminId);

                    if (admin is null || !admin.IsActive)
                    {
                        context.Fail("This admin account no longer has access.");
                    }
                },
            };
        });
}

builder.Services.AddAuthorization();

// =============================================================================
// AI assistant (Semantic Kernel + OpenAI)
// =============================================================================

// Bind the "Chat" section of appsettings.json onto the ChatOptions class, so the model name and
// limits are configuration rather than numbers buried in code.
builder.Services.Configure<ChatOptions>(builder.Configuration.GetSection(ChatOptions.SectionName));

// The key is read separately and never written to appsettings.json. In development it comes from
// .NET User Secrets, which live in your Windows user profile, outside this folder, so they cannot
// be committed by accident. In production it comes from an environment variable.
//
//   Set it with:  dotnet user-secrets set "Chat:ApiKey" "sk-your-key" --project KFC
//
// Configuration keys use ':' as the separator, so "Chat:ApiKey" means the ApiKey property of the
// Chat section. On Linux, where ':' is awkward in environment variables, use Chat__ApiKey instead.
var chatApiKey = builder.Configuration["Chat:ApiKey"];
var chatModel = builder.Configuration["Chat:Model"] ?? "gpt-4o-mini";
var chatBaseUrl = builder.Configuration["Chat:BaseUrl"];

if (!string.IsNullOrWhiteSpace(chatApiKey))
{
    // THIS IS THE ONLY PLACE THAT NAMES AN AI PROVIDER.
    //
    // It registers a Semantic Kernel "connector" - the adapter between SK's provider-neutral
    // IChatCompletionService interface and one particular AI service. BL_Chat asks the container
    // for IChatCompletionService and gets whatever was registered here, so the rest of the
    // application has no idea which company is answering.
    if (string.IsNullOrWhiteSpace(chatBaseUrl))
    {
        // Straight to OpenAI.
        builder.Services.AddOpenAIChatCompletion(modelId: chatModel, apiKey: chatApiKey);
    }
    else
    {
        // To any OpenAI-compatible provider (Groq, OpenRouter, a local Ollama...). They copy
        // OpenAI's HTTP shape exactly, so the same client works - it just needs a different
        // address. Changing provider is therefore configuration, not a code change.
        var client = new OpenAIClient(
            new ApiKeyCredential(chatApiKey),
            new OpenAIClientOptions { Endpoint = new Uri(chatBaseUrl) });

        builder.Services.AddOpenAIChatCompletion(modelId: chatModel, openAIClient: client);
    }
}
// If the key is missing we simply do not register it. BL_Chat then finds no chat service, reports
// itself as "not configured", and the endpoint returns a polite 503 - the website still runs fine.

builder.Services.AddScoped<BL_Chat>();

// The Angular dev server and any configured production origins.
const string CorsPolicyName = "KfcWebClient";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:4200", "https://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Says on every startup whether the assistant is on, and why if it is not. Without this, a missing
// key looks identical to a broken one - the bot is just silently absent.
app.Logger.LogInformation(
    "AI assistant: {State}",
    string.IsNullOrWhiteSpace(chatApiKey)
        ? "OFF - no Chat:ApiKey found in configuration (user secrets or the Chat__ApiKey environment variable)"
        : $"ON - model '{chatModel}' via {(string.IsNullOrWhiteSpace(chatBaseUrl) ? "OpenAI" : chatBaseUrl)}, key loaded ({chatApiKey.Length} chars)");


app.Logger.LogInformation(
    "Admin sign-in: {State}",
    string.IsNullOrWhiteSpace(signingKey) || signingKey.Length < 32
        ? "OFF - set Auth:SigningKey (32+ characters)"
        : "ON");

// Configure the HTTP request pipeline.
app.UseApiExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Skipped in development so the Angular dev server can call the HTTP endpoint without a redirect.
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicyName);

// Serves the published Angular build when it has been copied into wwwroot.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Angular client-side routes (/fruits, /vegetables, ...) resolve to index.html when a build is present.
if (File.Exists(Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "index.html")))
{
    app.MapFallbackToFile("index.html");
}

app.Run();
