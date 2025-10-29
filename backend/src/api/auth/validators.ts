import { z } from 'zod'

const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/
const ethereumSignatureRegex = /^0x[a-fA-F0-9]{130}$/

export const challengeSchema = z.object({
  walletAddress: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
})

export const verifySchema = z.object({
  walletAddress: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
  signature: z.string().regex(ethereumSignatureRegex, 'Invalid Ethereum signature'),
})

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

export type ChallengeInput = z.infer<typeof challengeSchema>
export type VerifyInput = z.infer<typeof verifySchema>
export type CreateActionInput = z.infer<typeof createActionSchema>
export type VerifyActionInput = z.infer<typeof verifyActionSchema>
