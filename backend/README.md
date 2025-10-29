# SpotMF Backend - Hono + Drizzle

A modern, type-safe backend built with **Hono**, **Drizzle ORM**, and **TypeScript**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate database schema
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Or run migrations (production)
pnpm db:migrate
```

### Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

### Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
src/
├── api/          # API routes (Hono)
├── services/     # Business logic
├── db/           # Drizzle schema & client
├── lib/          # Utilities
├── middleware/   # Hono middleware
└── main.ts       # Entry point
```

## 🔗 API Endpoints

### Health
- `GET /health` - Health check

### Authentication
- `POST /api/auth/challenge` - Generate auth challenge
- `POST /api/auth/verify` - Verify signature and login
- `POST /api/auth/create-action` - Create action nonce (requires JWT)
- `POST /api/auth/verify-action` - Verify action nonce (requires JWT)

### Strategy
- `POST /api/strategy/storeSignedStrategyTxn` - Store signed strategy transaction (requires JWT)
- `GET /api/strategy` - Get user strategies with pagination (requires JWT)
- `GET /api/strategy/:userStrategyId` - Get specific strategy (requires JWT)

## 🛠️ Tech Stack

- **Framework:** Hono
- **ORM:** Drizzle
- **Validation:** Zod
- **Database:** PostgreSQL (via Neon)
- **Auth:** JWT + Ethereum signatures (viem)
- **TypeScript:** Strict mode enabled

## 📦 Database Commands

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## 🧪 Code Quality

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks
- **lint-staged** - Staged file linting

## 🔐 Environment Variables

Required variables in `.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

## 📝 Migration Notes

This project was migrated from Express + Prisma to Hono + Drizzle. See `MIGRATION.md` for details.

## 🎯 Features

- ✅ Type-safe routing with Hono
- ✅ Type-safe database queries with Drizzle
- ✅ Zod validation with automatic type inference
- ✅ JWT authentication
- ✅ Ethereum wallet signature verification
- ✅ Standardized API responses
- ✅ Global error handling
- ✅ CORS support
- ✅ Logging utility
- ✅ ESLint + Prettier configured

## 📚 Documentation

- [Hono Documentation](https://hono.dev/)
- [Drizzle Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)

## 🤝 Contributing

1. Follow the code style defined in `claude.md`
2. Run `pnpm lint` and `pnpm format` before committing
3. Ensure `pnpm type-check` passes
4. Write tests for new features

---

Built with ❤️ using modern TypeScript practices
