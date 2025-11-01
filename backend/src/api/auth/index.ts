import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { success } from '@/lib/response.ts'
import { type AuthContext, authMiddleware } from '@/middleware/auth.ts'
import * as authService from '@/services/auth-service.ts'

import {
  createActionSchema,
  nonceSchema,
  verifyActionSchema,
  verifySchema,
} from './validators.ts'

export const authRoutes = new Hono<AuthContext>()

// SIWE-compliant endpoints (EIP-4361)
authRoutes.post('/nonce', zValidator('json', nonceSchema), async (c) => {
  const { address, chainId } = c.req.valid('json')
  const result = await authService.generateSiweNonce(address, chainId)
  return success(c, result)
})

authRoutes.post('/verify', zValidator('json', verifySchema), async (c) => {
  const { message, signature } = c.req.valid('json')
  const result = await authService.verifySiweAndLogin(message, signature)
  return success(c, result)
})

authRoutes.post(
  '/create-action',
  authMiddleware,
  zValidator('json', createActionSchema),
  async (c) => {
    const walletAddress = c.get('walletAddress')
    const body = c.req.valid('json')
    const result = await authService.createActionNonce({
      ...body,
      walletAddress,
    })
    return success(c, result)
  }
)

authRoutes.post(
  '/verify-action',
  authMiddleware,
  zValidator('json', verifyActionSchema),
  async (c) => {
    const walletAddress = c.get('walletAddress')
    const { message, signature } = c.req.valid('json')
    const result = await authService.verifyActionNonce(message, signature, walletAddress)
    return success(c, result)
  }
)
