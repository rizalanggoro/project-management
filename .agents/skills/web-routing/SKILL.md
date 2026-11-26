---
name: web-routing
description: >-
  Enforces folder-based TanStack Router conventions in the Project Management
  frontend (frontend/): every page route ends with index.tsx, with support for
  pathless layout routes (_<name>.tsx). Use when adding, modifying, or reviewing
  routes, pages, or navigation.
---

# Routing Guidelines — Project Management Frontend

Applies to `frontend/src/routes/` using **TanStack Router** with the Vite plugin in `frontend/vite.config.ts`.

---

## 1. Core Rule: Every Page Route Ends With `index.tsx`

Page routes must be folder-based. Flat page files (`projects.tsx`, `edit.tsx`) are forbidden.

| Route | ✅ CORRECT | ❌ FORBIDDEN |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | — |
| `/projects` | `src/routes/projects/index.tsx` | `src/routes/projects.tsx` |
| `/ahsp/new` | `src/routes/ahsp/new/index.tsx` | `src/routes/ahsp/new.tsx` |
| `/ahsp/$id/edit` | `src/routes/ahsp/$id/edit/index.tsx` | `src/routes/ahsp/$id/edit.tsx` |
| `/unit-prices` | `src/routes/unit-prices/index.tsx` | `src/routes/unit-prices.tsx` |

Exceptions:

1. Root route: `src/routes/__root.tsx`
2. Pathless layout routes: `src/routes/_<name>.tsx` (no URL segment)

### Current state

All page routes now follow the folder + `index.tsx` rule, including `src/routes/ahsp/$id/edit/index.tsx`.

Auth is currently handled inside `__root.tsx` via `useAuth()` + `navigate()` redirects for `/auth` and `/login`; there is no `_authenticated` layout yet. If a shared protected layout is introduced, follow the pathless layout pattern below.

---

## 2. Pathless Layout Routes (`_*.tsx`)

Use a pathless layout to group protected pages under a shared shell/guard without changing URLs:

```text
src/routes/
├── __root.tsx                 # global root: providers, shell, outlet
├── _authenticated.tsx         # layout + guard, no URL segment
├── _authenticated/
│   ├── index.tsx              # /
│   └── projects/
│       └── index.tsx          # /projects
├── auth/
│   └── index.tsx              # /auth (public)
└── routeTree.gen.ts           # generated — do not edit
```

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    // guard logic here
  },
  component: () => <Outlet />,
})
```

---

## 3. Route Component Template

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
})

function ProjectsPage() {
  return <div>Projects</div>
}
```

Dynamic parameters:

```tsx
export const Route = createFileRoute("/ahsp/$id/edit/")({
  component: EditAhspPage,
})

function EditAhspPage() {
  const { id } = Route.useParams()
  return <div>Edit AHSP {id}</div>
}
```

---

## 4. Route Tree Generation

`routeTree.gen.ts` is generated automatically by `@tanstack/router-plugin/vite` during `npm run dev` / `npm run build`. There is no `generate-routes` script. After adding or moving route folders, run:

```powershell
cd frontend
npm run build
```

and confirm `routeTree.gen.ts` was updated.

---

## 5. Checklist Before Finishing

- [ ] Page route lives in a folder named after its path segment
- [ ] Page route file is exactly `index.tsx`
- [ ] No new flat route files (except `__root.tsx` and `_*.tsx` layouts)
- [ ] `npm run build` passes and `routeTree.gen.ts` is regenerated
