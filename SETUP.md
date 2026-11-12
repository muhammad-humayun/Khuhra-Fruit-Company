# Khuhra Fruit Company — running this project on a new machine

A bilingual (English / Sindhi) shop site for a fruit and vegetable commission agent
in Sabzi Mandi, Larkana, plus an admin area where the owner sets prices.

Two applications in this folder:

| Folder          | What it is                                                |
| --------------- | --------------------------------------------------------- |
| `KFC`           | ASP.NET Core 8 Web API — Dapper + stored procedures, SQL Server |
| `KFC_Frontend`  | Angular 22 — zoneless, signals, standalone components, SCSS |

---

## 1. What you need installed

| Tool | Version | Check with |
| ---- | ------- | ---------- |
| .NET SDK | 8.0 or newer | `dotnet --version` |
| Node.js | 22 or newer | `node --version` |
| SQL Server | Express is fine | see below |

SQL Server Express: <https://www.microsoft.com/sql-server/sql-server-downloads>
(pick **Express**, then **Basic**). SSMS is optional but handy:
<https://aka.ms/ssmsfullsetup>

Confirm SQL Server is running and note the instance name:

```powershell
Get-Service | Where-Object { $_.Name -like 'MSSQL*' }
```

`MSSQL$SQLEXPRESS` means your instance is `localhost\SQLEXPRESS`. A plain
`MSSQLSERVER` means it is just `localhost`.

---

## 2. Create the database

One script does everything — tables, stored procedures, and the catalogue data
(10 categories and 43 products). It ships **no admin account**; you create yours
in step 6.

**Easiest:** open `KFC/Database/KFC_Database_Setup.sql` in SSMS and press Execute.

**Or from a terminal**, in `KFC/Database`:

```powershell
sqlcmd -S localhost\SQLEXPRESS -E -i KFC_Database_Setup.sql -f 65001
```

`-f 65001` tells sqlcmd the file is UTF-8. **Leave it out and every Sindhi name
loads as `????`.**

The script prints a check at the end. You want:

```
categories  products  showing_on_shop  no_price_yet  admin_accounts
10          43        43               2             0
```

(`admin_accounts` is 0 on a fresh database and stays whatever it was on a re-run —
the script never touches admin accounts.)

and a `first_codepoint` above 1500 on the Sindhi rows. If it says `63` — the code
for `?` — the file was read as plain text: re-run it with `-f 65001`, or use SSMS.

Safe to run again. It clears the categories and products tables and reloads them,
so re-running resets the catalogue back to the snapshot in the file.

---

## 3. Point the API at your SQL Server

Only needed if your instance is **not** `localhost\SQLEXPRESS`.

`KFC/KFC/appsettings.json` → `ConnectionStrings:DefaultConnection`:

```json
"Server=localhost\\SQLEXPRESS;Database=KFC;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
```

Change the `Server=` part to match. Keep the doubled backslash — it is JSON.

---

## 4. Set the two secrets

Neither is in the project files, on purpose, so nothing secret travels in a zip
or a repository. Set them once as **user environment variables**:

```powershell
# Required for the admin area. Any long random string, 32+ characters.
[Environment]::SetEnvironmentVariable(
  'Auth__SigningKey',
  [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 })),
  'User')

# Optional — only for the AI chat widget. Free key from https://console.groq.com
[Environment]::SetEnvironmentVariable('Chat__ApiKey', 'your-groq-key-here', 'User')
```

Then **close and reopen your terminal and Visual Studio.** A running process keeps
the environment it started with, so it will not see a variable set after it launched.

Notes:

- `Auth__SigningKey` is what makes an admin token impossible to forge. Treat it
  like a password. Changing it signs everyone out, which is harmless.
- The double underscore `__` is how .NET maps to the nested key `Auth:SigningKey`.
- `Chat__ApiKey` is optional. Without it the site runs fine; the chat widget just
  reports itself as unavailable.
- On this project, `dotnet user-secrets` was found **not** to load when launching
  from Visual Studio. Environment variables are the reliable route — use them.

---

## 5. Run it

Two terminals.

**API** — from the `KFC` folder:

```powershell
dotnet restore
dotnet run --project KFC --launch-profile http
```

Serves on <http://localhost:5077>, with Swagger at <http://localhost:5077/swagger>.

Two lines in the startup log tell you whether the secrets were picked up:

```
AI assistant: ON - model '...' / OFF - no Chat:ApiKey found ...
Admin sign-in: ON / OFF - set Auth:SigningKey (32+ characters)
```

If **Admin sign-in** says OFF, step 4 did not take — set the variable and restart
the terminal.

**Frontend** — from the `KFC_Frontend` folder:

```powershell
npm install
npm start
```

Serves on <http://localhost:4200>.

---

## 6. Check it works

| Where | What you should see |
| ----- | ------------------- |
| <http://localhost:4200> | Home page, hero slider, fruit photos |
| <http://localhost:4200/fruits> | 21 fruits, 4 per row, guava first, prices in PKR |
| <http://localhost:4200/admin> | Sign-in screen |

**Create the first admin account (once).** The database starts with no admin and
there is no public sign-up screen, so create it through the API. Open
<http://localhost:5077/swagger>, find `POST /api/auth/register`, and send:

```json
{ "email": "you@example.com", "displayName": "Your Name", "password": "at-least-8-characters" }
```

This endpoint only works while no admin exists; after your account is created it
refuses everyone. Then sign in at <http://localhost:4200/admin> with that email
and password.

Once in: **Dashboard** (counts and readiness), **Items & Prices** (edit items,
change a price, hide or show), **Admin Users** (add another admin).

A price changed in the admin area shows on the shop immediately — both read the
same database, there is no publish step.

---

## Troubleshooting

**Sindhi shows as `????`**
The SQL file was loaded without UTF-8. Re-run with `-f 65001` or execute it in SSMS.

**`MSB3027` / `MSB3021` — "file is locked by KFC.exe" when building**
An API process is still running. Stop it:

```powershell
Get-Process KFC -ErrorAction SilentlyContinue | Stop-Process -Force
```

A stale process also keeps answering requests with the *old* code, which makes a
fresh change look broken. Stop the API before every rebuild.

**"Cannot connect to the server" / login fails with a network error**
The API is not running, or it is on a different port. The frontend expects
<http://localhost:5077> — set in `KFC_Frontend/src/app/core/config/app-config.ts`
as `apiBaseUrl`. Both the `http` and `https` launch profiles bind 5077.

**Admin sign-in says the server is not configured**
`Auth__SigningKey` is missing or shorter than 32 characters. See step 4, and
restart the terminal afterwards.

**Node runs out of memory during a build**
On a machine with little free RAM, stop the dev server first and:

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=2048'
```

**Port 4200 already in use**

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## Things worth knowing before you change anything

- **Data access is Dapper + stored procedures**, not EF Core. Every query goes
  through `DapperWrapper` and names a procedure. A new query means a new procedure
  in `KFC/Database/`, not SQL in C#.
- **Layers:** `KFC` (controllers) → `BuisnessLogic` (BL_*) → `DataAccess` (DA_*),
  with `BuisnessObject` (BOL_*) holding the shapes. The folder spellings
  (`Buisness…`) are the project's own; keep them.
- **Every API response is wrapped** in `BOL_ApiResponse<T>`: `{ statusCode, message, data }`.
- **Angular is zoneless** and uses signals. No `zone.js`, no `NgModule`, no
  `*ngIf` — use `@if` / `@for`, `signal()`, `computed()`, `input()`.
- **Prices:** the admin sets ONE price per item plus a pack type (kg / small /
  dozen / piece / none). The pack ladder a shopper sees is derived from that pair
  in `core/data/pricing.data.ts` → `packsForProduct()`. An item with no price
  shows "rate on request" with a WhatsApp button — never a zero.
- **Deleting is hiding.** Products and admin accounts are switched off via
  `IsActive`, never deleted, so a mis-tap cannot destroy an item's Sindhi name,
  description and photo.
- **Admin accounts:** there is no public registration screen. A signed-in admin
  adds others from Admin Users. `/api/auth/register` still exists but only works
  while no admin exists at all — it is the way to recover from an empty table.
- **Tests:** `npm test` in `KFC_Frontend` (runs through the Angular builder, not
  vitest directly — `npx vitest` alone will fail).

## The prices are samples

The 43 products carry **placeholder prices**, not real Khuhra Fruit Company rates.
They exist so the shop works end to end. Set the real rates in **Items & Prices**
before showing the site to anyone.
