# 🧭 Claude Code Standards (Quick Reference)

> **📚 Full docs:** See `CLAUDE-reference.md` for detailed explanations and examples.

---

## 🏗️ Project Structure

```
src/
├── api/           # Route handlers (thin, declarative)
├── services/      # Business logic (pure functions)
├── db/            # Drizzle ORM: client, schema, migrations
├── lib/           # Generic utilities and helpers
├── middleware/    # Hono middlewares
├── cron/          # Scheduled jobs
├── config/        # Runtime configurations
├── types/         # Global type definitions
└── main.ts        # Entry point
```

**Golden Rule:** Each folder = one domain of responsibility. No mixing layers.

---

## 🧩 Core Principles (DRY)

### Layer Separation
- **Routes** → Handle I/O only, call services
- **Services** → All business logic, pure functions
- **DB queries** → Only in `src/db/` or service functions

### Reuse First
- ✅ Check existing helpers in `src/lib/` before creating new ones
- ✅ Use validators from feature's `validators.ts`
- ✅ Use response helpers: `success()` / `failure()` from `src/lib/response.ts`
- ✅ Import from folder roots via `@/` alias (e.g., `@/services`)
- ✅ Reuse middlewares from `src/middleware/`

### Single Source of Truth
- Centralize constants, config, and schema definitions
- Cron jobs import services (no logic in cron files)
- Index re-exports for clean imports

---

## 💅 Formatting & Linting

**Config:** See `eslint.config.js` for full rules.

**Key Standards:**
- TypeScript strict mode
- Auto-sorted imports, no duplicates, no unused imports
- Use logger (`src/lib/logger.ts`), not `console.log`
- Prettier: no semicolons, single quotes, 90 char width
- Git hooks: Husky + lint-staged for pre-commit checks

**Run:**
```bash
npm run lint      # Check
npm run lint:fix  # Auto-fix
```

---

## 🧠 Naming Conventions

- **PascalCase** → Types, interfaces, classes
- **camelCase** → Variables, functions
- **kebab-case** → Files, folders
- **Named exports** only (except entry points)
- Use `@/` alias, not relative paths

---

## 📦 Drizzle ORM Rules

- Schema in `src/db/schema.ts`
- Client in `src/db/client.ts`
- Never duplicate schema fields
- Always import schema, never recreate
- Migrations via `drizzle-kit`

---

## 🧱 Code Style: Function vs Class

- **Default:** Function-based modules (services, routes, utilities)
- **Classes:** Only for encapsulating external APIs or shared state
- **Never:** Classes for stateless CRUD or route handlers
- All services → pure functions returning typed results
- Prefer named exports

---

## ✅ Generation Checklist

Before submitting code:

- [ ] Follows existing folder structure
- [ ] Reuses helpers/validators (no duplication)
- [ ] Business logic in `services/`
- [ ] Routes are thin and declarative
- [ ] Uses response helpers
- [ ] Passes ESLint with zero warnings
- [ ] Formatted with Prettier
- [ ] TypeScript strict mode compliant
- [ ] Import order: core → external → internal

---

**🎯 TL;DR:** Keep code DRY, typed, layered, and consistent. Check existing code first. See `CLAUDE-reference.md` for details.
