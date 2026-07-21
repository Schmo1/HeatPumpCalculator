# Heat Pump Billing

Web application replacing the Excel file `Strom Heizung Rechner_new.xlsx`.
It manages the electricity and water billing for two apartments and displays energy
and water consumption in charts.

- **Frontend:** React + TypeScript + Vite, charts with Recharts, served via nginx
- **Backend:** ASP.NET Core 10 Web API, EF Core with **SQLite**
- **Auth:** JWT – one **Admin** (may enter/edit values) and any number of **readers** (view only)
- **Deployment:** fully in Docker (`docker compose`)

## Meter setup

- A **main electricity meter** (VKW) measures **heat pump + apartment 1 (David)**.
- The **heat pump** has its own **sub-meter**.
- **Apartment 2 (Sarah)** shares the heating costs; her share follows the
  **hot water ratio** from the water evaluation.

## Calculation logic (taken from the Excel file and verified)

**Billing (electricity/heating), per period:**

| Quantity | Formula |
|---|---|
| Heating consumption | `heating meter reading − previous meter reading` |
| David total cost | Sum of the monthly bills |
| Heating total cost | `DavidTotalCost ÷ TotalConsumption × HeatingConsumption` |
| David cost | `HeatingCost × (100 − SarahShare) / 100` |
| Sarah cost | `HeatingCost × SarahShare / 100` |

**Water, per period (difference to the previous period):** David's meters rise, Sarah's meters
count down from 100000. From this, consumption as well as `Sarah's hot water share` and
`Sarah's total share` are computed. The **"Init"** row serves only as a starting meter reading.

## Quick start (Docker)

Prerequisite: Docker Desktop is running.

```bash
# 1. Set environment variables
cp .env.example .env
#    In .env set at least: JWT_KEY (>= 32 characters), ADMIN_PASSWORD, READER_PASSWORD

# 2. Start
docker compose up -d --build

# 3. Open
#    http://localhost:8080   (or WEB_PORT from .env)
```

Sign in with the accounts configured in `.env` (default usernames `admin` / `viewer`).

Stop: `docker compose down` — the data is preserved in the volume `heatpump-data`.
Full reset (delete data): `docker compose down -v`.

### `.env` variables

| Variable | Meaning |
|---|---|
| `JWT_KEY` | Signing key for the tokens, **at least 32 characters**, keep secret |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin account (write access) |
| `READER_USERNAME` / `READER_PASSWORD` | Reader account (view only) |
| `WEB_PORT` | Host port of the web app (default 8080) |

> The accounts are aligned with the configuration on every start (role + password).
> A new password in `.env` is applied on the next `up`. Additional readers can be
> added by extending the seed logic in `backend/.../Data/DbSeeder.cs`.

## Architecture

```
Browser ──▶ web (nginx)
             ├─ serves the React SPA (static)
             └─ /api/*  ──▶ api (ASP.NET Core, port 8080)
                              └─ SQLite  (volume: /data/heatpump.db)
```

On first start the backend creates the database, migrates the schema and seeds the
initial data from the Excel file (sheets "Abrechnung", "Wasser Verbrauch", "Kosten …").

## Local development (without Docker)

**Backend** (requires .NET 10 SDK):

```bash
cd backend/HeatPumpCalculator.Api
dotnet run
# uses appsettings.Development.json: SQLite file locally,
# accounts admin/admin123 and viewer/viewer123, CORS for http://localhost:5173
# API at http://localhost:5099 (Swagger/OpenAPI is intentionally disabled)
```

**Frontend** (requires Node 20+):

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, /api is proxied to :5099
```

## REST API (excerpt)

| Method | Path | Role |
|---|---|---|
| `POST` | `/api/auth/login` | – |
| `GET` | `/api/auth/me` | authenticated |
| `GET` | `/api/billing-periods` | authenticated |
| `POST/PUT/DELETE` | `/api/billing-periods[/{id}]` | Admin |
| `POST/PUT/DELETE` | `/api/billing-periods/{id}/bills[/{billId}]` | Admin |
| `GET` | `/api/water-periods` | authenticated |
| `POST/PUT/DELETE` | `/api/water-periods[/{id}]` | Admin |
| `GET` | `/health` | – |

Reading requires authentication; write access is reserved for the Admin role
(enforced server-side, readers receive `403`).

## Troubleshooting

**Docker Desktop does not start** with a message like
`initializing Inference manager … remove …\dockerInference: The file cannot be accessed by
the system` (or similarly `…\docker-secrets-engine\engine.sock`): orphaned socket files after
an unclean shutdown. Repair:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-docker-start.ps1
```

The script stops Docker + WSL, renames the affected directories (Docker recreates them)
and restarts Docker Desktop. To prevent this, quit Docker Desktop cleanly via the tray icon
"Quit Docker Desktop" instead of hard-killing it.

## Project structure

```
HeatPumpCalculator/
├─ docker-compose.yml
├─ .env.example
├─ Strom Heizung Rechner_new.xlsx      # original Excel file (reference)
├─ backend/HeatPumpCalculator.Api/     # ASP.NET Core 10 Web API
│  ├─ Models/  Data/  Dtos/  Services/  Auth/  Controllers/
│  └─ Dockerfile
└─ frontend/                           # React + Vite + TypeScript
   ├─ src/ (api, auth, components, pages, utils)
   ├─ nginx.conf
   └─ Dockerfile
```
