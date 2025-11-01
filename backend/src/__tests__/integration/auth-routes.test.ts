/* global Request */
import { describe, expect, it, vi } from 'vitest'

import { authRoutes } from '@/api/auth/index.ts'

// Mock dependencies
vi.mock('@/services/auth-service.ts', () => ({
  generateSiweNonce: vi.fn(),
  verifySiweAndLogin: vi.fn(),
  createActionNonce: vi.fn(),
  verifyActionNonce: vi.fn(),
}))

vi.mock('@/middleware/auth.ts', () => ({
  authMiddleware: vi.fn((c, next) => next()),
  AuthContext: {},
}))

describe('Auth Routes Integration', () => {
  describe('POST /nonce', () => {
    it('should return 400 for invalid address format', async () => {
      const req = new Request('http://localhost/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'invalid-address',
          chainId: 1,
        }),
      })

      const res = await authRoutes.request(req)

      expect(res.status).toBe(400)
    })

    it('should return 400 for missing chainId', async () => {
      const req = new Request('http://localhost/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        }),
      })

      const res = await authRoutes.request(req)

      expect(res.status).toBe(400)
    })

    it('should return 400 for invalid chainId type', async () => {
      const req = new Request('http://localhost/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          chainId: 'invalid',
        }),
      })

      const res = await authRoutes.request(req)

      expect(res.status).toBe(400)
    })

    it('should successfully generate nonce with valid inputs', async () => {
      const { generateSiweNonce } = await import('@/services/auth-service.ts')

      vi.mocked(generateSiweNonce).mockResolvedValue({
        nonce: '2e3a5f74c4a9f1b2a8c9e0123d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
        message: 'localhost:3000 wants you to sign in...',
      })

      const req = new Request('http://localhost/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          chainId: 1,
        }),
      })

      const res = await authRoutes.request(req)
      const data = (await res.json()) as { data: { nonce: string; message: string } }

      expect(res.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('nonce')
      expect(data.data).toHaveProperty('message')
      expect(generateSiweNonce).toHaveBeenCalledWith(
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        1
      )
    })
  })

  describe('POST /verify', () => {
    it('should return 400 for missing message', async () => {
      const req = new Request('http://localhost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature:
            '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
        }),
      })

      const res = await authRoutes.request(req)

      expect(res.status).toBe(400)
    })

    it('should return 400 for invalid signature format', async () => {
      const req = new Request('http://localhost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'valid message',
          signature: 'invalid-signature',
        }),
      })

      const res = await authRoutes.request(req)

      expect(res.status).toBe(400)
    })

    it('should successfully verify with valid inputs', async () => {
      const { verifySiweAndLogin } = await import('@/services/auth-service.ts')

      vi.mocked(verifySiweAndLogin).mockResolvedValue({
        success: true,
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        sessionToken: 'mock-jwt-token',
      })

      const validMessage = `localhost:3000 wants you to sign in with your Ethereum account:
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

Sign in with Ethereum to authenticate your wallet

URI: http://localhost:3000/login
Version: 1
Chain ID: 1
Nonce: 2e3a5f74c4a9f1b2a8c9e0123d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
Issued At: 2025-11-01T10:30:00.000Z`

      const req = new Request('http://localhost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: validMessage,
          signature:
            '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
        }),
      })

      const res = await authRoutes.request(req)
      const data = (await res.json()) as {
        data: { success: boolean; sessionToken: string }
      }

      expect(res.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('success', true)
      expect(data.data).toHaveProperty('sessionToken')
      expect(verifySiweAndLogin).toHaveBeenCalled()
    })
  })

  describe('Validation', () => {
    it('should validate Ethereum address format', async () => {
      const invalidAddresses = [
        '0xInvalidAddress',
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE',
        '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
      ]

      for (const address of invalidAddresses) {
        const req = new Request('http://localhost/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            chainId: 1,
          }),
        })

        const res = await authRoutes.request(req)
        expect(res.status).toBe(400)
      }
    })

    it('should accept valid Ethereum addresses', async () => {
      const { generateSiweNonce } = await import('@/services/auth-service.ts')

      vi.mocked(generateSiweNonce).mockResolvedValue({
        nonce: 'test-nonce',
        message: 'test-message',
      })

      const validAddresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0x0000000000000000000000000000000000000000',
        '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      ]

      for (const address of validAddresses) {
        const req = new Request('http://localhost/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            chainId: 1,
          }),
        })

        const res = await authRoutes.request(req)
        expect(res.status).toBe(200)
      }
    })
  })
})
