# CLAUDE.md — Frontend Architecture Rules

> **For detailed examples and explanations, see [CLAUDE-reference.md](./CLAUDE-reference.md)**

## Tech Stack

- Next.js (App Router) + TypeScript
- UI: ShadCN + Tailwind CSS
- State: Zustand (client) + TanStack Query (server)
- Testing: Storybook

---

## Core Philosophy: Progressive Promotion

**Start local, promote when shared.**

- Components/hooks/utils used by ONE page → keep at page level
- When used by MULTIPLE pages → move to global directories

---

## File Placement Rules

### Components
```
Page-scoped:  src/app/{page}/components/ComponentName.tsx
Shared:       src/components/shared/ComponentName.tsx
UI (ShadCN):  src/components/ui/component-name.tsx
Layout:       src/components/layout/ComponentName.tsx
```

### Hooks
```
Page-scoped:  src/app/{page}/hooks/useFeature.ts
Shared:       src/hooks/useFeature.ts
```

### Utilities
```
Page-scoped:  src/app/{page}/utils/helper.ts
Shared:       src/lib/helper.ts
```

### Stories
```
Same directory as component → {ComponentName}.stories.tsx
Move with component when promoted
```

---

## State Management Boundaries

| Use Case | Solution | Location |
|----------|----------|----------|
| Local component state | `useState` | Component |
| Global UI state (theme, modals, filters) | Zustand | `src/store/` |
| Server data (API, DB) | TanStack Query | Hooks with `useQuery`/`useMutation` |

**Rules:**
- Never mix Zustand with server fetching → use TanStack Query
- Zustand stores: one per feature domain, in `src/store/`
- TanStack Query hooks: must start with `use`, live in `/hooks/`

---

## Naming Conventions

```
Components:      PascalCase       (UserAvatar.tsx)
Hooks:           camelCase        (useWalletConnect.ts)
Files/Folders:   kebab-case       (user-profile/)
Hooks pattern:   use[Feature][Verb]
```

---

## TypeScript

- Use absolute imports: `@/components/...`, `@/hooks/...`
- Strict mode ON
- Prefer named exports

---

## DO NOT

- ❌ Create shared components prematurely
- ❌ Mix Zustand with async server fetching
- ❌ Use relative imports for shared code
- ❌ Put server state in Zustand stores
- ❌ Create global utilities for single-page use

---

## Quick Reference

| Type | Start Here | Promote To |
|------|-----------|-----------|
| Component | `src/app/{page}/components/` | `src/components/shared/` |
| Hook | `src/app/{page}/hooks/` | `src/hooks/` |
| Utility | `src/app/{page}/utils/` | `src/lib/` |
| Story | Same dir as component | Moves with component |

**See [CLAUDE-reference.md](./CLAUDE-reference.md) for detailed examples, setup code, and architecture rationale.**
