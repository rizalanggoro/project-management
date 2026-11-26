# Project Management

Internal web app for monitoring construction projects and preparing cost estimates (RAB). API contract: [`openapi.yaml`](openapi.yaml).

```text
frontend/   Vite + React + TS, npm, shadcn/ui, Tailwind v4, TanStack Router + Query, hey-api client
backend/    Go 1.26 + Fiber v3, GORM, golang-migrate, PostgreSQL (DBngin / local)
```

## Getting Started

### 1. Database (DBngin)

1. Open **DBngin** and start the **PostgreSQL** service (default port `5432`).
2. Create a database named `musashi` (e.g. via TablePlus, pgAdmin, or DBngin CLI).
3. Create `backend/.env` from the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Adjust the database settings (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`) to match your local DBngin PostgreSQL service. Leave `DB_PASSWORD` empty if the service has no password.

### 2. Backend

```bash
cd backend
go run ./cmd/api            # http://localhost:8080/api/v1/health (migrations run automatically on start)
```

*Optional: migrations can also be run manually with `go run ./cmd/migrate`.*

### 3. Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173 (proxies /api → :8080)
```

Default administrator login:

- **Email:** `admin@musashi.local`
- **Password:** `admin123`

---

## API Changes

`openapi.yaml` is the source of truth for the API contract. After changing it:

```bash
cd frontend && npm run api     # regenerate src/api (client + TanStack Query hooks)
```

Do not edit files in `frontend/src/api/` — they are all generated.

## Build and Test

```bash
cd backend  && go build ./...
cd frontend && npm run build
cd frontend && npm test
```
