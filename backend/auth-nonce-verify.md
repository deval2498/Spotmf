# 🔐 EVM Wallet Authentication API

## 📘 Purpose

This document describes the `/auth/nonce` and `/auth/verify` endpoints for wallet-based authentication using Sign-In With Ethereum (SIWE / EIP-4361). Each EVM wallet acts as a unique user identity, eliminating the need for traditional username/password credentials.

**Authentication is based on:**
- Cryptographically secure nonces
- ECDSA signature verification
- One-time use nonce validation
- Session creation via JWT or Redis

---

## 🧩 Authentication Flow Overview

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │  Server  │                 │  Redis   │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  POST /auth/nonce          │                            │
     │  { address, chainId }      │                            │
     ├───────────────────────────>│                            │
     │                            │  Generate nonce            │
     │                            │  Store nonce + address     │
     │                            ├───────────────────────────>│
     │                            │                            │
     │  { nonce, message }        │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │  Sign message with wallet  │                            │
     │                            │                            │
     │  POST /auth/verify         │                            │
     │  { message, signature }    │                            │
     ├───────────────────────────>│                            │
     │                            │  Verify signature          │
     │                            │  Validate nonce            │
     │                            ├───────────────────────────>│
     │                            │  Delete used nonce         │
     │                            │<───────────────────────────┤
     │                            │  Create session/JWT        │
     │                            │                            │
     │  { success, sessionToken } │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

### Step-by-Step:

1. **Request Nonce** (`POST /auth/nonce`)
   - Client provides wallet address and chain ID
   - Server generates cryptographically secure nonce
   - Server stores nonce in Redis with 5-minute TTL
   - Server builds SIWE-compatible message
   - Returns nonce and message to client

2. **Sign Message** (Client-side)
   - User signs the message using their wallet (MetaMask, WalletConnect, etc.)
   - Creates ECDSA signature

3. **Verify Signature** (`POST /auth/verify`)
   - Client sends signed message + signature
   - Server verifies signature matches address
   - Server validates nonce exists and matches
   - Server marks nonce as used (deletes from Redis)
   - Server creates session (JWT or Redis session)
   - Returns access token

---

## ⚙️ `/auth/nonce` Endpoint

### **Method**
`POST /auth/nonce`

### **Request Body**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chainId": 1
}
```

**Field Descriptions:**
- `address` (string, required): Ethereum wallet address (checksummed or lowercase)
- `chainId` (number, required): EIP-155 chain ID (1 = Ethereum Mainnet, 137 = Polygon, etc.)

### **Response Body**
```json
{
  "nonce": "2e3a5f74c4a9f1b2a8c9e0123d4f5e6a",
  "message": "example.com wants you to sign in with your Ethereum account:\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\nSign in with Ethereum to the app\n\nURI: https://example.com/login\nVersion: 1\nChain ID: 1\nNonce: 2e3a5f74c4a9f1b2a8c9e0123d4f5e6a\nIssued At: 2025-11-01T10:30:00.000Z"
}
```

**Field Descriptions:**
- `nonce` (string): Unique random hex string (32 characters)
- `message` (string): EIP-4361 formatted message ready for wallet signing

### **Implementation Structure**

**Location:** `src/api/auth-routes.ts` (route handler)
**Service:** `src/services/auth-service.ts` (business logic)
**Validator:** `src/api/auth/validators.ts`

#### **Route Handler** (`src/api/auth-routes.ts`)
```typescript
import { Hono } from 'hono'
import { generateNonce } from '@/services/auth-service'
import { success, failure } from '@/lib/response'
import { validateNonceRequest } from './validators'
import { logger } from '@/lib/logger'

const authRoutes = new Hono()

authRoutes.post('/nonce', async (c) => {
  const body = await c.req.json()

  // Validate input
  const validation = validateNonceRequest(body)
  if (!validation.success) {
    return failure(c, 'Invalid request', 400, validation.errors)
  }

  try {
    const { address, chainId } = validation.data
    const result = await generateNonce(address, chainId)

    logger.info('Nonce generated', { address, chainId })
    return success(c, result)
  } catch (error) {
    logger.error('Nonce generation failed', { error })
    return failure(c, 'Failed to generate nonce', 500)
  }
})

export { authRoutes }
```

#### **Service Logic** (`src/services/auth-service.ts`)
```typescript
import { randomBytes } from 'crypto'
import { SiweMessage } from 'siwe'
import { redis } from '@/db/redis-client'
import { env } from '@/config/env'

interface NonceResult {
  nonce: string
  message: string
}

export async function generateNonce(
  address: string,
  chainId: number
): Promise<NonceResult> {
  // Generate cryptographically secure nonce
  const nonce = randomBytes(16).toString('hex')

  // Store nonce in Redis with 5-minute expiry
  const key = `nonce:${nonce}`
  await redis.set(key, address.toLowerCase(), { EX: 300 })

  // Build SIWE message
  const siweMessage = new SiweMessage({
    domain: env.APP_DOMAIN,
    address,
    uri: `${env.APP_URL}/login`,
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    statement: 'Sign in with Ethereum to the app',
  })

  return {
    nonce,
    message: siweMessage.prepareMessage(),
  }
}
```

#### **Validator** (`src/api/auth/validators.ts`)
```typescript
import { z } from 'zod'

const nonceRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  chainId: z.number().int().positive(),
})

export function validateNonceRequest(data: unknown) {
  return nonceRequestSchema.safeParse(data)
}
```

### **Error Responses**

| Status | Description | Example Response |
|--------|-------------|------------------|
| 400 | Invalid address format or missing fields | `{ "success": false, "message": "Invalid request", "errors": [...] }` |
| 429 | Rate limit exceeded | `{ "success": false, "message": "Too many requests" }` |
| 500 | Internal server error (Redis failure, etc.) | `{ "success": false, "message": "Failed to generate nonce" }` |

---

## ⚙️ `/auth/verify` Endpoint

### **Method**
`POST /auth/verify`

### **Request Body**
```json
{
  "message": "example.com wants you to sign in with your Ethereum account:\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\nSign in with Ethereum to the app\n\nURI: https://example.com/login\nVersion: 1\nChain ID: 1\nNonce: 2e3a5f74c4a9f1b2a8c9e0123d4f5e6a\nIssued At: 2025-11-01T10:30:00.000Z",
  "signature": "0x8d3f5e9a2b1c4d7e0f3a6b8c1d4e7f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b8c1d4e7f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e1c"
}
```

**Field Descriptions:**
- `message` (string, required): The exact SIWE message that was signed
- `signature` (string, required): Hex-encoded ECDSA signature from wallet (0x-prefixed)

### **Response Body**

**Success:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJhZGRyZXNzIjoiMHg3NDJkMzVDYzY2MzRDMDUzMjkyNWEzYjg0NEJjOWU3NTk1ZjBiRWIiLCJpYXQiOjE2OTg4MjQ0MDB9.signature"
}
```

**Field Descriptions:**
- `success` (boolean): Always `true` on successful verification
- `address` (string): Verified wallet address (checksummed)
- `sessionToken` (string): JWT access token or session identifier

### **Implementation Structure**

**Location:** `src/api/auth-routes.ts` (route handler)
**Service:** `src/services/auth-service.ts` (business logic)
**Validator:** `src/api/auth/validators.ts`

#### **Route Handler** (`src/api/auth-routes.ts`)
```typescript
authRoutes.post('/verify', async (c) => {
  const body = await c.req.json()

  // Validate input
  const validation = validateVerifyRequest(body)
  if (!validation.success) {
    return failure(c, 'Invalid request', 400, validation.errors)
  }

  try {
    const { message, signature } = validation.data
    const result = await verifySignature(message, signature)

    logger.info('Signature verified', { address: result.address })
    return success(c, result)
  } catch (error) {
    const statusCode = error instanceof AuthError ? error.statusCode : 500
    logger.error('Signature verification failed', { error })
    return failure(c, error.message, statusCode)
  }
})
```

#### **Service Logic** (`src/services/auth-service.ts`)
```typescript
import { SiweMessage } from 'siwe'
import { getAddress } from 'ethers'
import { redis } from '@/db/redis-client'
import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateJwt } from '@/lib/jwt'
import { env } from '@/config/env'

interface VerifyResult {
  success: boolean
  address: string
  sessionToken: string
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function verifySignature(
  message: string,
  signature: string
): Promise<VerifyResult> {
  // Parse SIWE message
  let siweMessage: SiweMessage
  try {
    siweMessage = new SiweMessage(message)
  } catch (error) {
    throw new AuthError('Invalid message format', 400)
  }

  // Verify signature
  try {
    const result = await siweMessage.verify({
      signature,
      domain: env.APP_DOMAIN,
    })

    if (!result.success) {
      throw new AuthError('Invalid signature', 401)
    }
  } catch (error) {
    throw new AuthError('Signature verification failed', 401)
  }

  // Validate nonce exists and matches address
  const nonceKey = `nonce:${siweMessage.nonce}`
  const storedAddress = await redis.get(nonceKey)

  if (!storedAddress) {
    throw new AuthError('Nonce expired or not found', 410)
  }

  // Delete nonce to prevent reuse
  await redis.del(nonceKey)

  // Verify address matches
  if (storedAddress.toLowerCase() !== siweMessage.address.toLowerCase()) {
    throw new AuthError('Address mismatch', 401)
  }

  // Validate domain
  if (siweMessage.domain !== env.APP_DOMAIN) {
    throw new AuthError('Domain mismatch', 401)
  }

  // Validate chain ID (if you want to restrict to specific chains)
  const allowedChainIds = [1, 137, 8453] // Ethereum, Polygon, Base
  if (!allowedChainIds.includes(siweMessage.chainId)) {
    throw new AuthError('Chain not supported', 400)
  }

  // Find or create user
  const checksummedAddress = getAddress(siweMessage.address)
  const user = await findOrCreateUser(checksummedAddress)

  // Generate JWT session token
  const sessionToken = generateJwt({
    userId: user.id,
    address: checksummedAddress,
  })

  return {
    success: true,
    address: checksummedAddress,
    sessionToken,
  }
}

async function findOrCreateUser(address: string) {
  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, address))
    .limit(1)

  if (existingUser) {
    return existingUser
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      walletAddress: address,
      createdAt: new Date(),
    })
    .returning()

  return newUser
}
```

#### **Validator** (`src/api/auth/validators.ts`)
```typescript
const verifyRequestSchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
})

export function validateVerifyRequest(data: unknown) {
  return verifyRequestSchema.safeParse(data)
}
```

### **Error Responses**

| Status | Description | Example Response |
|--------|-------------|------------------|
| 400 | Invalid message format or unsupported chain | `{ "success": false, "message": "Invalid message format" }` |
| 401 | Signature verification failed or address mismatch | `{ "success": false, "message": "Invalid signature" }` |
| 410 | Nonce expired or already used | `{ "success": false, "message": "Nonce expired or not found" }` |
| 500 | Internal server error | `{ "success": false, "message": "Internal server error" }` |

---

## 🧱 Security Requirements

### 1. **Nonce Generation**
- ✅ Use `crypto.randomBytes(16)` for cryptographically secure randomness
- ✅ Minimum 16 bytes (32 hex characters)
- ❌ Never use `Math.random()` or predictable sequences

### 2. **Nonce Storage & Lifecycle**
- ✅ Store in Redis with 5-minute TTL (`EX: 300`)
- ✅ Key format: `nonce:{nonce}`, value: `{address}`
- ✅ Delete immediately after successful verification
- ✅ One-time use only (prevent replay attacks)
- ❌ Never reuse nonces across sessions

### 3. **Signature Verification**
- ✅ Use `siwe` library for EIP-4361 compliance
- ✅ Verify domain matches your backend domain
- ✅ Verify address recovered from signature matches stored address
- ✅ Validate chain ID is in allowed list
- ❌ Never skip signature verification

### 4. **Session Management**
- ✅ Use HttpOnly cookies for web apps (prevents XSS)
- ✅ Use short-lived JWTs (15-60 minutes) with refresh tokens
- ✅ Store refresh tokens in Redis with long TTL
- ✅ Include user ID and address in JWT payload
- ❌ Never store JWTs in localStorage

### 5. **Rate Limiting**
- ✅ Limit `/auth/nonce`: 10 requests/minute per IP
- ✅ Limit `/auth/verify`: 5 requests/minute per IP
- ✅ Track failed verification attempts per address
- ✅ Implement exponential backoff for repeated failures

### 6. **Logging & Monitoring**
- ✅ Log all nonce generation (IP + address + timestamp)
- ✅ Log all verification attempts (success/failure)
- ✅ Alert on unusual patterns (rapid nonce requests, high failure rate)
- ❌ Never log signatures or private keys

### 7. **Validation Checklist**

For each `/auth/verify` request, validate:
- [ ] Message format matches EIP-4361 spec
- [ ] Signature is valid ECDSA signature
- [ ] Nonce exists in Redis
- [ ] Nonce has not expired
- [ ] Address from signature matches stored address
- [ ] Domain matches expected domain (`env.APP_DOMAIN`)
- [ ] Chain ID is in allowed list
- [ ] Timestamp is recent (optional: validate `issuedAt`)

---

## 🗃️ Database Schema

### **Users Table** (`src/db/schema.ts`)
```typescript
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  walletAddress: varchar('wallet_address', { length: 42 })
    .notNull()
    .unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
})
```

### **Redis Keys**
- **Nonce storage:** `nonce:{nonce}` → `{address}`
  - TTL: 300 seconds (5 minutes)
  - Purpose: Validate nonce during verification

- **Session storage (optional):** `session:{userId}` → `{sessionData}`
  - TTL: 3600 seconds (1 hour)
  - Purpose: Alternative to JWT for server-side sessions

---

## 🧪 Testing Checklist

### Unit Tests (`src/services/auth-service.test.ts`)
- [ ] Nonce generation creates unique 32-character hex strings
- [ ] Nonce is stored in Redis with correct TTL
- [ ] SIWE message includes all required fields
- [ ] Signature verification accepts valid signatures
- [ ] Signature verification rejects invalid signatures
- [ ] Signature verification fails for expired nonces
- [ ] Signature verification fails for reused nonces
- [ ] Address mismatch throws error
- [ ] Domain mismatch throws error
- [ ] Unsupported chain ID throws error
- [ ] User creation works for new addresses
- [ ] Existing users are found correctly

### Integration Tests (`tests/auth.integration.test.ts`)
- [ ] Full flow: nonce → sign → verify → JWT
- [ ] Rate limiting triggers on excessive requests
- [ ] Nonce expires after 5 minutes
- [ ] Concurrent requests don't create race conditions
- [ ] Invalid JSON returns 400
- [ ] Malformed addresses return 400

### Manual Testing Checklist
- [ ] Test with MetaMask on Ethereum Mainnet
- [ ] Test with WalletConnect on Polygon
- [ ] Test nonce expiry (wait 5+ minutes)
- [ ] Test reused nonce (should fail)
- [ ] Test wrong signature (should fail)
- [ ] Test rate limiting (spam requests)

---

## 🛠️ Required Dependencies

```json
{
  "dependencies": {
    "siwe": "^2.1.4",
    "ethers": "^6.9.0",
    "hono": "^3.11.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "vitest": "^1.0.0"
  }
}
```

---

## 🌍 Environment Variables

### Required Configuration (`src/config/env.ts`)
```bash
# Application
APP_DOMAIN=example.com
APP_URL=https://example.com

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=15m  # 15 minutes

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Rate Limiting
RATE_LIMIT_NONCE=10  # requests per minute
RATE_LIMIT_VERIFY=5  # requests per minute

# Allowed Chain IDs (comma-separated)
ALLOWED_CHAIN_IDS=1,137,8453  # Ethereum, Polygon, Base
```

---

## 🧭 File Structure

```
src/
├── api/
│   ├── auth-routes.ts          # Route handlers for /auth/nonce and /auth/verify
│   └── auth/
│       └── validators.ts        # Zod schemas for request validation
├── services/
│   └── auth-service.ts          # Business logic: generateNonce, verifySignature
├── lib/
│   ├── response.ts              # success() and failure() helpers
│   ├── jwt.ts                   # generateJwt() and verifyJwt()
│   └── logger.ts                # Logging utility
├── db/
│   ├── client.ts                # Drizzle database client
│   ├── schema.ts                # Database schema (users table)
│   └── redis-client.ts          # Redis client setup
├── middleware/
│   └── rate-limit.ts            # Rate limiting middleware
├── config/
│   └── env.ts                   # Environment variable validation
└── types/
    └── auth.ts                  # Type definitions for auth
```

---

## 📚 Additional Resources

- **EIP-4361 Spec:** https://eips.ethereum.org/EIPS/eip-4361
- **SIWE Library:** https://docs.login.xyz/
- **Ethers.js Docs:** https://docs.ethers.org/v6/
- **Drizzle ORM:** https://orm.drizzle.team/
- **Hono Framework:** https://hono.dev/

---

## 🔄 Maintenance Instructions

**For Claude Code:**

When updating this documentation:
1. Locate the relevant section (e.g., "Security Requirements", "Service Logic")
2. Modify only the necessary parts
3. Preserve code formatting and structure
4. Update version/date if major changes
5. Cross-reference with `CLAUDE.md` for code style consistency

**Update triggers:**
- API endpoint changes (new fields, different responses)
- Security improvements (new validation rules)
- Library upgrades (SIWE, ethers.js version bumps)
- Error handling changes
- New environment variables

---

---

## ✅ Implementation Status

**Status:** ✅ Fully Implemented and Tested
**Last Updated:** 2025-11-01
**Maintained by:** Claude Code
**Version:** 2.0.0

### Changes from v1.0:
- ✅ Removed legacy `/challenge` and `/verify` endpoints
- ✅ Simplified to SIWE-only implementation
- ✅ Updated validators to use `nonceSchema` and `verifySchema`
- ✅ Added comprehensive test suite (23 passing tests)
- ✅ Removed unused `createAuthMessage` and `createSiweMessage` helpers
- ✅ Integrated checksum address handling with ethers.js `getAddress()`

### Test Coverage:
- **Unit Tests:** crypto-service (8 tests), auth-service (6 tests)
- **Integration Tests:** auth routes (9 tests)
- **Total:** 23 passing tests, 1 skipped
- **Test Command:** `pnpm test`

---

**Last Updated:** 2025-11-01
**Maintained by:** Claude Code
**Version:** 2.0.0
