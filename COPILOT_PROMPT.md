# Prompt for GitHub Copilot

Paste the block below into Copilot Chat as your **first message** after opening
this folder. It tells Copilot what the project is, how it runs, and the rules it
must follow so its suggestions match the existing code.

For VS Code you can instead save it as `.github/copilot-instructions.md` in this
folder — Copilot reads that automatically on every request, so you never have to
paste it again.

---

```
You are helping me run and extend "Khuhra Fruit Company" — a bilingual
(English/Sindhi) website for a fruit and vegetable commission agent (arhti) at
Sabzi Mandi, Larkana, Pakistan. It has a public shop and an admin area where the
owner adds produce and sets daily prices.

PROJECT LAYOUT
  KFC/           ASP.NET Core 8 Web API
  KFC_Frontend/  Angular 22 single-page app
  KFC/Database/  SQL scripts (KFC_Database_Setup.sql creates everything)
  SETUP.md       full setup and troubleshooting guide — read it before
                 answering any "how do I run this" question

HOW TO RUN IT ON THIS MACHINE
  1. Database — run KFC/Database/KFC_Database_Setup.sql once, in SSMS, or:
       sqlcmd -S localhost\SQLEXPRESS -E -i KFC_Database_Setup.sql -f 65001
     The -f 65001 is required. Without it the Sindhi text loads as "????".
  2. Secret — the admin area needs a signing key as a USER environment variable,
     then a terminal restart:
       [Environment]::SetEnvironmentVariable('Auth__SigningKey', '<32+ chars>', 'User')
     Optional: Chat__ApiKey (a free Groq key) switches on the AI chat widget.
     Do NOT suggest `dotnet user-secrets` — on this machine it does not load
     when launching from Visual Studio. Environment variables are what work.
  3. API — from KFC/:  dotnet run --project KFC --launch-profile http
     Serves http://localhost:5077, Swagger at /swagger.
  4. Frontend — from KFC_Frontend/:  npm install && npm start
     Serves http://localhost:4200. Admin area at /admin.

ARCHITECTURE RULES — follow these, do not substitute your own preference
  * Data access is DAPPER + STORED PROCEDURES. Not EF Core. Never suggest EF,
    LINQ-to-entities, migrations or a DbContext. Every query goes through
    DapperWrapper and names a stored procedure. A new query means a new
    procedure in KFC/Database/ plus a DA_ method that calls it.
  * Layers: KFC (controllers) -> BuisnessLogic (BL_*) -> DataAccess (DA_*),
    with BuisnessObject (BOL_*) for the shapes. Controllers hold no logic and
    never touch the database directly.
  * The folder and class spellings "Buisness..." are this project's own. Keep
    them. Do not "fix" them.
  * Every API response is wrapped in BOL_ApiResponse<T>:
    { statusCode, message, data }.
  * Angular is ZONELESS and signal-based. No zone.js, no NgModule, no
    *ngIf/*ngFor/*ngSwitch. Use standalone components, @if / @for / @switch,
    signal(), computed(), effect(), input(), output().
    changeDetection: ChangeDetectionStrategy.OnPush on every component.
  * Styles are global SCSS in KFC_Frontend/src/styles/. Admin styles live in
    _admin.scss and are prefixed (.ashell, .anav, .acard, .apform, .itemrow) so
    they cannot reach the public pages. The production build caps a single
    component stylesheet at 8 kB — that is why shared styles are global.
  * Text is bilingual. Every customer-facing string has an English and a Sindhi
    entry in core/i18n/translations.ts, and SD is typed against the keys of EN,
    so a missing Sindhi string is a compile error. Sindhi is RTL: use logical
    CSS properties (margin-inline-start, inset-inline-end), never left/right.
    The admin screens are intentionally English-only.

DOMAIN RULES THAT MATTER
  * PRICES: the admin sets ONE price per item plus a pack type
    (kg | small | dozen | piece | none). The pack sizes a shopper picks from are
    derived from that pair by packsForProduct() in core/data/pricing.data.ts.
    An item with NO price must show "rate on request" with a WhatsApp button —
    never a price of 0. There are tests for this; keep them passing.
  * DELETING IS HIDING. Products and admin accounts are switched off via an
    IsActive flag, never deleted, so a mis-tap cannot destroy an item's Sindhi
    name, description and photo.
  * ADMIN ACCOUNTS: there is no public registration screen. A signed-in admin
    adds others from the Admin Users screen. /api/auth/register still exists but
    works only while no admin exists at all — it is how you recover from an
    empty Admins table. Every admin is equal; there are no lesser roles.
  * AUTH: JWT bearer tokens. Passwords are hashed one-way with
    PasswordHasher<string> and never stored readably. The admin token is put on
    requests by an HTTP interceptor and ONLY on /api/admin/ URLs — never let it
    reach a third-party host such as the Wikimedia image URLs. The API also
    re-checks on every request that the account is still active, so removing
    someone's access takes effect immediately rather than when their token
    expires.
  * SECRETS NEVER GO IN PROJECT FILES. No API key, signing key or password in
    appsettings.json, in the Angular source, or anywhere that reaches the
    browser. Environment variables only.

WORKING AGREEMENT
  * Before every rebuild of the API, stop any running one, or the build fails
    with MSB3027 "file is locked by KFC.exe":
      Get-Process KFC -ErrorAction SilentlyContinue | Stop-Process -Force
    A stale process also keeps serving OLD code, which makes a fresh change look
    broken.
  * Run frontend tests with `npm test` (the Angular builder). `npx vitest`
    directly will fail — it misses the Angular test setup.
  * This is PowerShell on Windows. `&&` and `||` do not work in PowerShell 5.1;
    use `;` or `if ($?) { ... }`.
  * The prices currently in the database are PLACEHOLDERS, not real rates.

When I ask for a change, match the surrounding code's style and comment density,
and tell me plainly if something I ask for conflicts with the rules above.
```
