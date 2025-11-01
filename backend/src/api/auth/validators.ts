import { z } from 'zod'

const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/
const ethereumSignatureRegex = /^0x[a-fA-F0-9]{130}$/

// SIWE authentication schemas
export const nonceSchema = z.object({
  address: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
  chainId: z.number().int().positive(),
})

export const verifySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string().regex(ethereumSignatureRegex, 'Invalid Ethereum signature'),
})

// Action verification schemas
export const createActionSchema = z.object({
  action: z.enum([
    'CREATE_STRATEGY',
    'UPDATE_STRATEGY',
    'DELETE_STRATEGY',
    'UPDATE_PROFILE',
  ]),
  strategyType: z.enum(['DCA', 'DCA_WITH_DMA']).optional(),
  asset: z.enum(['BTC', 'ETH', 'HYPE']).optional(),
  intervalAmount: z.string().optional(),
  intervalDays: z.string().optional(),
  acceptedSlippage: z.string().optional(),
  totalAmount: z.string().optional(),
  strategyId: z.string().optional(),
})

export const verifyActionSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string().regex(ethereumSignatureRegex, 'Invalid Ethereum signature'),
})

// Type exports
export type NonceInput = z.infer<typeof nonceSchema>
export type VerifyInput = z.infer<typeof verifySchema>
export type CreateActionInput = z.infer<typeof createActionSchema>
export type VerifyActionInput = z.infer<typeof verifyActionSchema>
