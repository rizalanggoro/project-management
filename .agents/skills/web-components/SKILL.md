---
name: web-components
description: >-
  Enforces frontend component architecture, folder organization, kebab-case file
  naming, and barrel export conventions in the Project Management frontend
  (frontend/). Use whenever creating, refactoring, or organizing UI components.
---

# Component Architecture — Project Management Frontend

Applies to `frontend/src/components/` in this repo. shadcn/ui primitives live in `ui/`; domain-aware components live in feature folders.

---

## 1. File Names Must Be `kebab-case`

All component files use `kebab-case.tsx` (lowercase, hyphen-separated). PascalCase/camelCase file names are prohibited.

| Component | ✅ CORRECT | ❌ FORBIDDEN |
| --- | --- | --- |
| `ProjectDetailDialog` | `components/projects/project-detail-dialog.tsx` | `ProjectDetailDialog.tsx` |
| `UnitPriceTable` | `components/unit-prices/unit-price-table.tsx` | `unitPriceTable.tsx` |
| `AhspForm` | `components/ahsp/ahsp-form.tsx` | `AhspForm.tsx` |

Inside the file, component functions and types still use PascalCase (`export function ProjectDetailDialog()`, `export interface ProjectDetailDialogProps`).

---

## 2. Directory Structure

```text
frontend/src/components/
├── ui/                       # ONLY shadcn/ui primitives (button.tsx, dialog.tsx, …)
├── ahsp/                     # feature: ahsp-form.tsx, unit-price-picker-dialog.tsx, index.ts
├── projects/                 # feature: add-project-dialog.tsx, edit-project-dialog.tsx,
│                             #          project-detail-dialog.tsx, constants.ts, index.ts
├── unit-prices/              # feature: unit-price-table.tsx, unit-price-dialog.tsx,
│                             #          unit-price-category-filter.tsx, constants.ts, index.ts
└── layout/                   # feature: shell-related components extracted from routes
```

- `ui/` is for low-level, domain-agnostic shadcn primitives only.
- Every custom feature folder **must** contain an `index.ts` barrel file.
- New shared chrome (theme toggle, page header, etc.) should go into a feature folder such as `components/layout/` with its own `index.ts`.

### Legacy exceptions

These files still sit directly in `src/components/` from earlier work:

- `formula-badge.tsx`
- `mode-toggle.tsx`
- `module-placeholder.tsx`
- `page-header.tsx`
- `theme-provider.tsx`

Do not add new loose files there. Move them into an appropriate feature folder when you next touch them.

---

## 3. Mandatory Barrel (`index.ts`)

```typescript
// frontend/src/components/projects/index.ts
export * from "./add-project-dialog";
export * from "./edit-project-dialog";
export * from "./project-detail-dialog";
```

Consumers import from the folder root:

```tsx
import { AddProjectDialog, ProjectDetailDialog } from "@/components/projects";
```

---

## 4. Import Conventions

Always use the `@/` alias (configured in `frontend/vite.config.ts` → `./src`). Never use `#/`, deep relative parents, or deep paths into feature folders.

```tsx
// ✅ PREFERRED
import { Button } from "@/components/ui/button";
import { UnitPriceTable } from "@/components/unit-prices";

// ❌ FORBIDDEN
import { UnitPriceTable } from "@/components/unit-prices/unit-price-table";
import { Button } from "../../components/ui/button";
```

---

## 5. Prohibited Practices

- PascalCase/camelCase file names
- New component files directly in `src/components/`
- Domain logic inside `components/ui/`
- Feature folders without `index.ts`
- `#/` alias or deep file-path imports

---

## 6. Checklist Before Finishing

- [ ] File name is `kebab-case.tsx`
- [ ] Component is in `ui/` only if it is a shadcn primitive, otherwise a feature folder
- [ ] Feature folder has an `index.ts` barrel
- [ ] Imports use `@/` and the folder root
- [ ] `npm run build` passes
