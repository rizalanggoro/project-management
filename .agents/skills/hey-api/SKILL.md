---
name: hey-api
description: >-
  Generates the TypeScript API client and TanStack Query options from the
  swaggo-generated Swagger spec using @hey-api/openapi-ts. Use whenever backend
  handlers/DTOs or the API contract change, or when integrating frontend
  queries and mutations in frontend/.
---

# Hey API SDK & TanStack Query Generator

This skill manages OpenAPI code generation for the **Project Management** frontend (`frontend/`) from the Go backend. The backend uses **swaggo** annotations to produce `backend/docs/swagger.yaml`, which `@hey-api/openapi-ts` turns into a typed fetch client plus TanStack Query v5 options.

## Key Files

| Purpose | Path |
| --- | --- |
| API contract (source of truth) | `openapi.yaml` |
| Generator config | `frontend/openapi-ts.config.ts` |
| Swaggo input | `backend/cmd/api/main.go` (`// @title`, `// @...`) |
| Generated Swagger spec | `backend/docs/swagger.yaml` (also `.json`, `docs.go`) |
| Generated SDK output | `frontend/src/api/` |
| Query options | `frontend/src/api/@tanstack/react-query.gen.ts` |
| Types | `frontend/src/api/types.gen.ts` |
| Fetch client | `frontend/src/api/client.gen.ts` |

Never edit files under `frontend/src/api/` by hand — they are generated.

---

## Generation Runbook

### Option 1: One command (recommended)

From `frontend/`, regenerate Swagger with swaggo and then the SDK:

```powershell
cd frontend
npm run api:all
```

Equivalent to:

```powershell
cd backend
swag init -g cmd/api/main.go -o ./docs --parseDependency --parseInternal --useStructName --requiredByDefault
cd ../frontend
npm run api
```

### Option 2: Automated script

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/hey-api/scripts/generate-sdk.ps1
```

### Option 3: SDK only (Swagger spec already up to date)

```powershell
cd frontend
npm run api
```

### Verify

```powershell
npm run build
npm test
```

---

## Configuration Reference (`frontend/openapi-ts.config.ts`)

```typescript
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../backend/docs/swagger.yaml',
  output: 'src/api',
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
})
```

The client is configured in `frontend/src/main.tsx`: `credentials: 'include'`, optional `VITE_API_BASE_URL` normalized to end with `/api/v1`, and a request interceptor attaching `Authorization: Bearer <musashi_token>` from `localStorage`. In local dev, Vite proxies `/api` to `http://localhost:8080`.

---

## Usage Guide

### Standard TanStack Query pattern (options spread)

Always spread generated options into `useQuery` / `useMutation`:

```tsx
import { useQuery } from '@tanstack/react-query'
import { listProjectsOptions } from '@/api/@tanstack/react-query.gen'

const query = useQuery({
  ...listProjectsOptions({ query: { q: search } }),
  enabled: true,
})
```

With a path parameter:

```tsx
import { getProjectOptions } from '@/api/@tanstack/react-query.gen'

const query = useQuery({
  ...getProjectOptions({ path: { id: projectId } }),
})
```

See [TanStack Query Reference](references/tanstack-query.md) for queries, mutations, cache invalidation, and base URL setup.
