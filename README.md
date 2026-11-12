<h1 align="center">🍋 Khuhra Fruit Company (KFC)</h1>

<p align="center">
  A bilingual <b>English / Sindhi</b> shop website for a real fruit and vegetable commission agent<br/>
  at Sabzi Mandi, Larkana — with an owner admin area and an <b>AI assistant</b> built on Semantic Kernel.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white" alt=".NET 8"/>
  <img src="https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?logo=dotnet&logoColor=white" alt="ASP.NET Core"/>
  <img src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" alt="Angular 22"/>
  <img src="https://img.shields.io/badge/SQL%20Server-Stored%20Procedures-CC2927?logo=microsoftsqlserver&logoColor=white" alt="SQL Server"/>
  <img src="https://img.shields.io/badge/Dapper-micro--ORM-2D3748" alt="Dapper"/>
  <img src="https://img.shields.io/badge/Semantic%20Kernel-LLM-0078D4" alt="Semantic Kernel"/>
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT"/>
</p>

---

> **Project status:** a working project built for a family business. The shop, the admin area and the
> AI assistant all run end to end. It is **not production-hardened yet** — see
> [Known limitations](#%EF%B8%8F-known-limitations) and the [Roadmap](#%EF%B8%8F-roadmap).
> The prices in the seed data are **placeholders**, not the company's real rates.

**Contents:** [What it does](#-what-it-does) · [Architecture](#-architecture) · [AI assistant](#-ai-assistant) · [Security](#-security) · [Getting started](#-getting-started) · [API overview](#-api-overview) · [Tests](#-tests) · [Known limitations](#%EF%B8%8F-known-limitations) · [Roadmap](#%EF%B8%8F-roadmap) · [Credits](#-credits) · [Author](#-author)

## ✨ What it does

| Area | What it does |
|---|---|
| **Shop** | Customers browse fruits and vegetables (10 categories, 43 seeded products) with photos, seasons and prices in PKR. |
| **Bilingual + RTL** | Every customer-facing string exists in **English and Sindhi**. Sindhi switches the whole layout to right-to-left at runtime, with no reload. A missing Sindhi string is a compile error. |
| **Basket → WhatsApp order** | There is no payment gateway. The basket becomes a written order the customer sends over WhatsApp — which is how a mandi commission agent actually takes orders. |
| **"Rate on request"** | An item with no price never shows 0; it shows a WhatsApp enquiry button instead. |
| **Admin area** | The owner signs in at `/admin` to add items, change a price, hide or show an item, and manage other admin users. A price change shows on the shop immediately. |
| **AI assistant** | A chat widget answers general questions about produce, how a commission agent works and how to use the site — in English, Sindhi or Urdu. |
| **Works offline from the API** | If the API cannot be reached, the shop falls back to a bundled catalogue so the public pages still render. |

## 🧱 Architecture

```
┌────────────────────────┐   HTTP/JSON   ┌──────────────────────────────────┐  Dapper + SPs  ┌─────────────┐
│  Angular 22 (SPA)      │ ────────────▶ │  ASP.NET Core 8 Web API          │ ─────────────▶ │ SQL Server  │
│  zoneless, signals,    │ ◀──────────── │  Controllers → BL_* → DA_*       │ ◀───────────── │ tables +    │
│  standalone, SCSS      │               │  JWT auth · Semantic Kernel      │                │ stored procs│
└────────────────────────┘               └───────────────┬──────────────────┘                └─────────────┘
                                                         │ OpenAI-compatible API
                                                         ▼
                                              LLM provider (Groq by default)
```

**Backend (`KFC/`)** — four projects, one job each:

- `KFC` — thin controllers, middleware, startup. Every response is wrapped in `BOL_ApiResponse<T>` (`statusCode`, `message`, `data`).
- `BuisnessLogic` (`BL_*`) — the rules: catalogue, auth, the chat assistant.
- `DataAccess` (`DA_*`) — **Dapper calling SQL Server stored procedures only**; no inline SQL, no EF Core.
- `BuisnessObject` (`BOL_*`) — the request/response shapes.
- `Database/` — SQL scripts; `KFC_Database_Setup.sql` creates everything in one run.

**Frontend (`KFC_Frontend/`)** — Angular 22, **zoneless** and signal-based (`signal()`, `computed()`, `@if` / `@for`), standalone components with `OnPush`, a hand-written SCSS design system (no UI framework), an HTTP interceptor that attaches the admin token **only** to `/api/admin/` requests, and a route guard on the admin pages.

```
KFC_Project/
├─ KFC/                    # ASP.NET Core 8 solution (KFC.sln)
│  ├─ KFC/                 # Web API: Controllers, Middleware, Program.cs
│  ├─ BuisnessLogic/       # BL_Catalogue, BL_Auth, BL_Chat, options
│  ├─ DataAccess/          # DapperContext, DapperWrapper, DA_* repositories
│  ├─ BuisnessObject/      # BOL_* models
│  └─ Database/            # schema, stored procedures, seed data
├─ KFC_Frontend/           # Angular 22 app
│  └─ src/app/{core,layout,pages,shared}
├─ SETUP.md                # full setup + troubleshooting guide
└─ COPILOT_PROMPT.md       # project rules for an AI coding assistant
```

## 🤖 AI assistant

The chat widget calls `POST /api/chat`; the server talks to the model. The browser never sees the API key.

- **Semantic Kernel** — `BL_Chat` depends only on SK's provider-neutral `IChatCompletionService`. The provider is named in exactly one place (`Program.cs`).
- **Provider is configuration, not code** — any OpenAI-compatible endpoint works by changing `Chat:BaseUrl` and `Chat:Model`: Groq (default, free tier), OpenAI, OpenRouter, or a local Ollama.
- **Guard-railed system prompt** — the assistant is told plainly that it has **no access to live stock or prices**, must never invent a price or a delivery promise, and should send such questions to WhatsApp. It replies in the visitor's language and in plain text.
- **Cost controls** — conversation history is trimmed to the last N messages, answers are capped by `MaxResponseTokens`, and each call has a timeout that is also cancelled if the visitor closes the tab.
- **Fails soft** — with no API key the site runs normally and the widget reports itself unavailable (`GET /api/chat/status`). Upstream error details are logged, never returned to the browser.

Today the assistant is a general helper. Giving it real tools (function calling against the catalogue) is the first AI item on the [Roadmap](#%EF%B8%8F-roadmap).

## 🔐 Security

What is in place:

- **Secrets never live in project files.** The JWT signing key (`Auth__SigningKey`) and the LLM key (`Chat__ApiKey`) come from environment variables / user-secrets only.
- **Passwords are hashed** with ASP.NET Core's `PasswordHasher` (salted, one-way). The hash is never selected by list queries or returned by the API.
- **JWT bearer auth** on every `/api/admin/*` endpoint, with issuer, audience, lifetime and signing-key validation and only 30 seconds of clock skew.
- **Revocation that takes effect immediately** — every admin request re-checks that the account is still active, so switching an admin off locks them out now, not when their token expires.
- **No public sign-up.** `/api/auth/register` works only while no admin exists at all, then closes itself. Further admins are added by a signed-in admin.
- **No account enumeration** — a wrong e-mail and a wrong password return the same message.
- **Lock-out protection** — an admin cannot disable their own account or the last active admin.
- **Deleting is hiding** — products and admins are deactivated, never deleted.
- **CORS allow-list** from configuration; the admin token is never sent to third-party hosts.

## 🚀 Getting started

Full step-by-step instructions and troubleshooting are in **[SETUP.md](SETUP.md)**. The short version:

**Prerequisites:** .NET SDK 8+, Node.js 22+, SQL Server (Express is fine).

```powershell
# 1 · Database (the -f 65001 keeps the Sindhi text intact)
cd KFC/Database
sqlcmd -S localhost\SQLEXPRESS -E -i KFC_Database_Setup.sql -f 65001

# 2 · Secrets, as user environment variables (then reopen the terminal)
[Environment]::SetEnvironmentVariable('Auth__SigningKey', '<any random string, 32+ characters>', 'User')
[Environment]::SetEnvironmentVariable('Chat__ApiKey', '<optional: your Groq key>', 'User')

# 3 · API  →  http://localhost:5077/swagger
cd KFC
dotnet run --project KFC --launch-profile http

# 4 · Frontend  →  http://localhost:4200
cd KFC_Frontend
npm install
npm start
```

The database ships with **no admin account**. Create the first one once through `POST /api/auth/register` (easiest from Swagger), then sign in at `http://localhost:4200/admin`.

## 🔌 API overview

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | – | Health check |
| `GET` | `/api/categories` | – | Shop categories |
| `GET` | `/api/products` | – | Shop products with prices |
| `POST` | `/api/chat` | – | Ask the AI assistant |
| `GET` | `/api/chat/status` | – | Is the assistant switched on |
| `GET` | `/api/auth/status` | – | Is sign-in configured / does an admin exist |
| `POST` | `/api/auth/register` | – | First-run only: create the first admin |
| `POST` | `/api/auth/login` | – | Sign in, returns a JWT |
| `GET` `POST` | `/api/admin/products` | Admin | List / add items |
| `GET` `PUT` | `/api/admin/products/{id}` | Admin | Read / edit an item |
| `PUT` | `/api/admin/products/{id}/price` | Admin | Change a price |
| `PUT` | `/api/admin/products/{id}/active` | Admin | Show or hide an item |
| `GET` `POST` | `/api/admin/users` | Admin | List / add admin users |
| `GET` | `/api/admin/users/me` | Admin | The signed-in admin |
| `PUT` | `/api/admin/users/{id}/active` | Admin | Give or remove access |
| `PUT` | `/api/admin/users/me/password` | Admin | Change own password |

Sample requests are in [`KFC/KFC/KFC.http`](KFC/KFC/KFC.http).

## 🧪 Tests

```bash
cd KFC_Frontend
npm test        # 46 unit tests (Vitest, through the Angular builder)
```

The tests cover the pricing rules (including "never show a price of 0"), the admin auth service and the token interceptor. The backend has no automated tests yet.

## ⚠️ Known limitations

- **No rate limiting** on `/api/chat` or `/api/auth/login`. A public LLM endpoint without a limit can be abused to burn the API quota, and the login can be brute-forced.
- **The admin token is kept in `localStorage`**, which is readable by any script on the page.
- **The AI assistant has no tools** — it cannot read live prices or stock, by design for now.
- **Chat history lives in server memory** (`IMemoryCache`): lost on restart, not shared between servers.
- **Market-rate feed is paused.** The `/api/prices` endpoints and their background refresh service exist in code but are not registered at startup.
- **All admins are equal** — there are no roles below Admin.
- **No backend tests, no CI, no deployment setup** yet.
- **Sindhi translations are a working draft** and should be reviewed by a native speaker before launch.

## 🗺️ Roadmap

**Security**
- [ ] Rate limiting on chat and login (ASP.NET Core rate limiter), plus login lock-out after repeated failures
- [ ] Move the admin token to an httpOnly cookie or add short-lived access + refresh tokens
- [ ] Security headers and a tighter `AllowedHosts` for production
- [ ] Admin roles (owner / price editor) and an audit log of price changes

**AI**
- [ ] Function calling: let the assistant read today's prices and availability from the catalogue
- [ ] RAG over business knowledge (seasons, storage tips, ordering process)
- [ ] Durable chat history (Redis or a table) and per-session usage limits
- [ ] Prompt-injection hardening and logging of refused requests

**Product**
- [ ] Re-enable the market-rate board when an authorised Larkana rate feed exists
- [ ] Backend unit tests, GitHub Actions CI, Docker Compose (API + SQL Server)
- [ ] Deployment and real product photography

## 🙏 Credits

Product photographs are freely licensed images from **Wikimedia Commons** (CC BY, CC BY-SA, GFDL, CC0 and public domain). Licences that require attribution are credited per image in [`KFC_Frontend/src/app/core/data/produce-photos.ts`](KFC_Frontend/src/app/core/data/produce-photos.ts).

"KFC" here is only the short form of **Khuhra Fruit Company**; this project has no connection to any other company using those initials.

## 👤 Author

**Muhammad Humayun** — Software Developer at Logicose, Karachi · BS Computer Science, Iqra University

[Portfolio](https://muhammad-humayun.github.io/) · [GitHub](https://github.com/muhammad-humayun) · [LinkedIn](https://www.linkedin.com/in/muhammad-humayun-dev)

This is the working codebase of a real business. The code is public for learning and review; please ask before reusing the business name, content or branding.
