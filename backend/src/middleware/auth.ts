import type { Context, Next } from 'hono'

import { failure } from '@/lib/response.ts'
import { verifyJWT } from '@/services/crypto-service.ts'

export type AuthContext = {
  Variables: {
    walletAddress: string
  }
}

export async function authMiddleware(c: Context<AuthContext>, next: Next) {
  const authHeader = c.req.header('authorization')

  if (!authHeader) {
    return failure(c, 'No token provided', 401)
  }

  const token = authHeader.substring(7)
  const payload = verifyJWT(token)

  if (!payload || !payload.walletAddress) {
    return failure(c, 'Invalid token', 401)
  }

  c.set('walletAddress', payload.walletAddress as string)

  return await next()
}
