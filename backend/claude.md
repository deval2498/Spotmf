# 🧭 Claude Code Standards & Repo Guidelines

This document defines conventions and practices for generating, organizing, and maintaining code within this repository.

The goal is to maintain **clarity, modularity, and zero duplication** while ensuring consistency across all features and contributors.

---

## 🏗️ 1. Project Structure

All source code lives under the `src/` directory:

```
src/
├── api/                  # Route handlers and sub-routers
│   ├── index.ts          # Root router mounting all routes
│   ├── users/            # Feature-specific routes
│   │   ├── index.ts
│   │   └── validators.ts
│   ├── auth/
│   ├── cron/
│   │   ├── dailyReport.ts
│   │   └── cleanupOldSessions.ts
│   └── ...
│
├── services/             # Business logic (pure functions)
│   ├── userService.ts
│   ├── authService.ts
│   ├── emailService.ts
│   └── ...
│
├── db/                   # Drizzle ORM setup and schema
│   ├── client.ts
│   ├── schema.ts
│   └── migrations/
│
├── lib/                  # Generic utilities and helpers
│   ├── env.ts
│   ├── logger.ts
│   ├── response.ts
│   └── errors.ts
│
├── middleware/           # Hono middlewares (auth, cors, etc.)
│   ├── auth.ts
│   ├── cors.ts
│   ├── rateLimit.ts
│   └── ...
│
├── cron/                 # Scheduled background jobs
│   ├── index.ts
│   ├── jobRunner.ts
│   └── jobs/
│       ├── cleanUpSessions.ts
│       └── syncData.ts
│
├── config/               # Runtime configurations
│   ├── hono.ts
│   ├── redis.ts
│   └── cors.ts
│
├── types/                # Global type definitions
│   ├── context.ts
│   ├── env.ts
│   └── index.d.ts
│
└── main.ts               # Application entry point
```

**Rule:**  
Each folder represents one domain of responsibility — no mixing of routes, services, or DB logic across layers.

---

## 🧩 2. Code Duplication Rules (DRY Principles)

To maintain a **single source of truth**, always follow these rules when creating or modifying code:

1. **Business logic lives in `src/services/`.**  
   Never write DB queries or core logic inside route files.  
   Routes handle only input/output and call service functions.

2. **Check before creating new helpers.**  
   Reuse or extend functions from `src/lib/` or another service when possible.

3. **Use validators consistently.**  
   Input schemas live in `validators.ts` within each feature folder.

4. **Use standardized responses.**  
   Always use `success()` and `failure()` from `src/lib/response.ts`.

5. **Do not reimplement middleware.**  
   All reusable middlewares belong in `src/middleware/`.

6. **Cron jobs reuse services.**  
   Cron files import and invoke logic from services; they must not contain business logic directly.

7. **Centralize database access.**  
   All Drizzle ORM queries live in `src/db/` or inside service functions.

8. **Use index re-exports.**  
   Each folder with multiple modules must have an `index.ts`.  
   Always import from folder roots (e.g., `@/services`, not `@/services/userService`).

9. **Avoid duplicate constants.**  
   Use a shared constants or config file for common values like roles, API versions, etc.

10. **Review before duplication.**  
    Always check for existing implementations before adding new code.

---

## 💅 3. Formatting & Linting

Code style and formatting are enforced via **ESLint** and **Prettier**.

### ✅ ESLint Rules

Key standards:

- TypeScript linting with `@typescript-eslint`
- Auto-sorted imports
- Unused imports removed automatically
- `console.log` discouraged (only `warn`/`error` allowed)
- Duplicate imports disallowed

Example `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  env: { node: true, es2022: true },
  plugins: [
    "@typescript-eslint",
    "import",
    "unused-imports",
    "simple-import-sort",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/no-duplicates": "error",
    curly: ["error", "all"],
    eqeqeq: ["error", "always"],
  },
};
```

**Optional restriction example:**

```js
'no-restricted-imports': [
  'error',
  {
    paths: [
      { name: '@/db/client', message: 'Do not import DB client directly in routes. Use services instead.' }
    ],
    patterns: ['src/api/**/db/**']
  }
]
```

---

### 🎨 Prettier Rules

`.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 90,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "always",
  "bracketSpacing": true
}
```

**Formatting rules:**

- No semicolons
- Single quotes
- Max line width: 90
- Auto-format on save (via VS Code or lint-staged)

---

### 🪝 Git Hooks

Use **Husky** + **lint-staged** to keep commits clean:

```bash
npm i -D husky lint-staged
npx husky add .husky/pre-commit "npx lint-staged"
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js,json,md}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 🧠 4. TypeScript & Naming Conventions

- Enable `"strict": true` in `tsconfig.json`
- **PascalCase** → types, interfaces, classes
- **camelCase** → variables, functions
- **kebab-case** → files, folders
- **Named exports** only (except entry points)
- Use `@/` alias instead of long relative paths

Example:

```ts
// ✅ Preferred
import { createUser } from "@/services/userService";

// ❌ Avoid
import { createUser } from "../../services/userService";
```

---

## 📦 5. Drizzle ORM Integration Rules

- Define schema in `src/db/schema.ts`
- Initialize Drizzle client in `src/db/client.ts`
- Never duplicate schema fields or column names in services
- Always import schema definitions, not recreate them
- Manage migrations via `drizzle-kit`

Example:

```ts
// src/db/client.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

## ⚙️ 6. General Code Quality Practices

- Always return structured JSON responses
- Handle errors via `src/lib/errors.ts`
- Use `src/lib/logger.ts` (not `console.log`)
- Keep route files short (<100 lines when possible)
- Use JSDoc only for complex logic
- Import order:
  1. Node core modules
  2. External packages
  3. Internal modules (`@/services`, `@/lib`, etc.)

---

## 🧱 7. Summary Checklist for Claude

When generating or editing code:

✅ Use the existing folder structure  
✅ Reuse existing helpers and validators  
✅ Keep all business logic in `services/`  
✅ Keep routes lightweight and declarative  
✅ Use response helpers for all outputs  
✅ Maintain consistent Prettier formatting  
✅ Pass ESLint with zero warnings  
✅ Never duplicate logic or schema definitions

## 🧩 8. Code Style: Function vs Class

- Default to **function-based** modules for services, routes, and utilities.
- Use **classes** only when encapsulating external APIs or shared state across methods.
- Do **not** use classes for stateless CRUD logic or Hono route handlers.
- All service logic should be **pure functions** returning typed results.
- Prefer named exports over default exports.
- When using classes (e.g. for EmailClient, StorageAdapter), instantiate them once and expose functional wrappers if reused frequently.

---

Following this guide ensures all generated code remains **DRY**, **typed**, **consistent**, and **production-grade** — without redundant implementations.
