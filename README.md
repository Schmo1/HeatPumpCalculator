# Wärmepumpen-Abrechnung

Webanwendung als Ersatz für die Excel-Datei `Strom Heizung Rechner_new.xlsx`.
Sie verwaltet die Strom- und Wasserabrechnung zweier Wohnungen und stellt Energie-
und Wasserverbräuche in Diagrammen dar.

- **Frontend:** React + TypeScript + Vite, Diagramme mit Recharts, ausgeliefert über nginx
- **Backend:** ASP.NET Core 10 Web-API, EF Core mit **SQLite**
- **Auth:** JWT – ein **Admin** (darf Werte eintragen/ändern) und beliebige **Leser** (nur Ansicht)
- **Betrieb:** komplett in Docker (`docker compose`)

## Zähler-Aufbau

- Ein **Haupt-Stromzähler** (VKW) misst **Wärmepumpe + Wohnung 1 (David)**.
- Die **Wärmepumpe** hat einen eigenen **Subzähler**.
- **Wohnung 2 (Sarah)** wird an den Heizkosten beteiligt; ihr Anteil folgt dem
  **Warmwasser-Verhältnis** aus der Wasserauswertung.

## Rechenlogik (aus der Excel übernommen und verifiziert)

**Abrechnung (Strom/Heizung), je Zeitraum:**

| Größe | Formel |
|---|---|
| Verbrauch Heizung | `Zählerstand Heizung − vorheriger Zählerstand` |
| Kosten David Gesamt | Summe der Monatsrechnungen |
| Kosten Heizung gesamt | `KostenDavidGesamt ÷ VerbrauchGesamt × VerbrauchHeizung` |
| Kosten David | `KostenHeizung × (100 − AnteilSarah) / 100` |
| Kosten Sarah | `KostenHeizung × AnteilSarah / 100` |

**Wasser, je Zeitraum (Differenz zum Vorzeitraum):** David-Zähler steigen, Sarahs Zähler
fallen ab 100000. Daraus werden Verbräuche sowie `Warmwasser-Anteil Sarah` und
`Gesamt-Anteil Sarah` berechnet. Die Zeile **„Init"** dient nur als Ausgangs-Zählerstand.

## Schnellstart (Docker)

Voraussetzung: Docker Desktop läuft.

```bash
# 1. Umgebungsvariablen setzen
cp .env.example .env
#    In .env mindestens setzen: JWT_KEY (>= 32 Zeichen), ADMIN_PASSWORD, READER_PASSWORD

# 2. Starten
docker compose up -d --build

# 3. Öffnen
#    http://localhost:8080   (bzw. WEB_PORT aus .env)
```

Anmeldung mit den in `.env` gesetzten Konten (Standard-Benutzernamen `admin` / `viewer`).

Stoppen: `docker compose down` — die Daten bleiben im Volume `heatpump-data` erhalten.
Komplett zurücksetzen (Daten löschen): `docker compose down -v`.

### `.env`-Variablen

| Variable | Bedeutung |
|---|---|
| `JWT_KEY` | Signaturschlüssel der Tokens, **mindestens 32 Zeichen**, geheim halten |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin-Konto (Schreibrechte) |
| `READER_USERNAME` / `READER_PASSWORD` | Leser-Konto (nur Ansicht) |
| `WEB_PORT` | Host-Port der Web-App (Standard 8080) |

> Die Konten werden bei jedem Start aus der Konfiguration angeglichen (Rolle + Passwort).
> Ein neues Passwort in `.env` wird beim nächsten `up` übernommen. Weitere Leser lassen sich
> ergänzen, indem man die Seed-Logik in `backend/.../Data/DbSeeder.cs` erweitert.

## Architektur

```
Browser ──▶ web (nginx)
             ├─ liefert die React-SPA (statisch)
             └─ /api/*  ──▶ api (ASP.NET Core, Port 8080)
                              └─ SQLite  (Volume: /data/heatpump.db)
```

Beim ersten Start legt das Backend die Datenbank an, migriert das Schema und sät die
Ausgangsdaten aus der Excel (Blätter „Abrechnung", „Wasser Verbrauch", „Kosten …").

## Lokale Entwicklung (ohne Docker)

**Backend** (benötigt .NET 10 SDK):

```bash
cd backend/HeatPumpCalculator.Api
dotnet run
# nutzt appsettings.Development.json: SQLite-Datei lokal,
# Konten admin/admin123 und viewer/viewer123, CORS für http://localhost:5173
# API unter http://localhost:5099 (Swagger/OpenAPI ist bewusst nicht aktiv)
```

**Frontend** (benötigt Node 20+):

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, /api wird an :5099 weitergeleitet
```

## REST-API (Auszug)

| Methode | Pfad | Rolle |
|---|---|---|
| `POST` | `/api/auth/login` | – |
| `GET` | `/api/auth/me` | angemeldet |
| `GET` | `/api/billing-periods` | angemeldet |
| `POST/PUT/DELETE` | `/api/billing-periods[/{id}]` | Admin |
| `POST/PUT/DELETE` | `/api/billing-periods/{id}/bills[/{billId}]` | Admin |
| `GET` | `/api/water-periods` | angemeldet |
| `POST/PUT/DELETE` | `/api/water-periods[/{id}]` | Admin |
| `GET` | `/health` | – |

Lesen erfordert Anmeldung; schreibende Zugriffe sind der Admin-Rolle vorbehalten
(Server-seitig erzwungen, Leser erhalten `403`).

## Troubleshooting

**Docker Desktop startet nicht** mit einer Meldung wie
`initializing Inference manager … remove …\dockerInference: The file cannot be accessed by
the system` (oder analog `…\docker-secrets-engine\engine.sock`): verwaiste Socket-Dateien nach
unsauberem Beenden. Reparatur:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-docker-start.ps1
```

Das Skript beendet Docker + WSL, benennt die betroffenen Verzeichnisse um (Docker legt sie neu
an) und startet Docker Desktop wieder. Zur Vorbeugung Docker Desktop über das Tray-Icon
„Quit Docker Desktop" sauber beenden statt hart zu killen.

## Projektstruktur

```
HeatPumpCalculator/
├─ docker-compose.yml
├─ .env.example
├─ Strom Heizung Rechner_new.xlsx      # Original-Excel (Referenz)
├─ backend/HeatPumpCalculator.Api/     # ASP.NET Core 10 Web-API
│  ├─ Models/  Data/  Dtos/  Services/  Auth/  Controllers/
│  └─ Dockerfile
└─ frontend/                           # React + Vite + TypeScript
   ├─ src/ (api, auth, components, pages, utils)
   ├─ nginx.conf
   └─ Dockerfile
```
