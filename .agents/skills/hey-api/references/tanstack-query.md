# TanStack Query with Hey API — Project Management Frontend

## Generated Output (`frontend/src/api/`)

- `client.gen.ts` — fetch client instance created by `@hey-api/client-fetch`.
- `sdk.gen.ts` — one raw function per endpoint.
- `types.gen.ts` — request/response types (`ListProjectsData`, `GetProjectData`, …).
- `@tanstack/react-query.gen.ts` — query/mutation option factories and query key builders.
- `core/`, `client/` — generator internals; do not edit.

---

## Client Configuration

Configured once in `frontend/src/main.tsx`:

```typescript
import { client } from './api/client.gen'

const clientConfig: Parameters<typeof client.setConfig>[0] = {
  credentials: 'include',
}

if (import.meta.env.VITE_API_BASE_URL) {
  const rawBase = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  clientConfig.baseUrl = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`
}

client.setConfig(clientConfig)
```

Local dev: leave `VITE_API_BASE_URL` unset and let Vite proxy `/api` to `:8080` (see `frontend/vite.config.ts`). Session cookie is sent via `credentials: 'include'`; the request interceptor adds a Bearer token from `localStorage['musashi_token']` when present.

---

## Consuming in Components

### 1. `useQuery` with options spread

```tsx
import { useQuery } from '@tanstack/react-query'
import { listProjectsOptions } from '@/api/@tanstack/react-query.gen'

export function ProjectsPage() {
  const query = useQuery({
    ...listProjectsOptions({ query: { q: search } }),
  })

  if (query.isLoading) return <div>Loading...</div>
  if (query.error) return <div>Failed to load projects: {query.error.message}</div>

  return <>{query.data?.data.map((project) => <div key={project.id}>{project.name}</div>)}</>
}
```

Path parameters:

```tsx
const query = useQuery({
  ...getProjectOptions({ path: { id: projectId } }),
  staleTime: 1000 * 60 * 5,
})
```

### 2. Cache invalidation with generated query keys

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { listProjectsQueryKey } from '@/api/@tanstack/react-query.gen'

const queryClient = useQueryClient()

queryClient.invalidateQueries({ queryKey: listProjectsQueryKey() })
```

### 3. Mutations

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProjectMutation,
  listProjectsQueryKey,
} from '@/api/@tanstack/react-query.gen'

const queryClient = useQueryClient()
const mutation = useMutation({
  ...createProjectMutation(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: listProjectsQueryKey() })
  },
})

mutation.mutate({ body: { name: 'New project', /* ... */ } })
```

Money and decimal fields arrive as strings from the API. Format them with `formatRupiah` / `formatDecimal` from `@/lib/utils` (thin wrappers around `Intl.NumberFormat('id-ID')`).
