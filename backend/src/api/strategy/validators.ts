import { z } from 'zod'

export const storeStrategySchema = z.object({
  txHash: z.string().min(1, 'Transaction hash is required'),
  actionId: z.string().min(1, 'Action ID is required'),
})

export const getStrategiesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  cursor: z.string().optional(),
})

export const strategyIdSchema = z.object({
  userStrategyId: z.string().min(1, 'Strategy ID is required'),
})

export type StoreStrategyInput = z.infer<typeof storeStrategySchema>
export type GetStrategiesQuery = z.infer<typeof getStrategiesQuerySchema>
export type StrategyIdInput = z.infer<typeof strategyIdSchema>
