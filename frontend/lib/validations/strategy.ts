import { z } from 'zod';

// Define TypeScript types to match your Prisma enums
export type STRATEGY_TYPE = 'DCA' | 'DCA_WITH_DMA';
export type ASSET_TYPE = 'BTC' | 'ETH' | 'HYPE';

// Define enum schemas
const StrategyTypeSchema = z.enum(['DCA', 'DCA_WITH_DMA'], {
  errorMap: () => ({ message: "Strategy type must be one of: DCA, DCA_WITH_DMA" })
});

const AssetTypeSchema = z.enum(['BTC', 'ETH', 'HYPE'], {
  errorMap: () => ({ message: "Asset must be one of: BTC, ETH, HYPE" })
});

// Main strategy schema with proper types
export const strategySchema = z.object({
  strategyType: StrategyTypeSchema,
  asset: AssetTypeSchema,
  intervalAmount: z.string()
    .min(1, "Interval amount is required")
    .refine((val) => {
      try {
        if (typeof val === 'bigint') {
          return val > 0n;
        }
        const num = parseInt(val, 10);
        return Number.isInteger(num) && num > 0;
      } catch {
        return false;
      }
    }, {
        message: "Interval amount must be a positive number (in wei)"
    }),
  intervalDays: z.number()
    .int("Interval days must be an integer")
    .positive("Interval days must be positive"),
  acceptedSlippage: z.number()
    .min(0, "Accepted slippage cannot be negative")
    .max(100, "Accepted slippage cannot exceed 100%"),
  totalAmount: z.string()
    .min(1, "Total amount is required")
    .refine((val) => {
      try {
        const num = BigInt(val);
        return num > 0n;
      } catch {
        return false;
      }
    }, {
      message: "Total amount must be a positive number (in wei)"
    })
});

// Form schema for string inputs that need transformation
export const strategyFormSchema = z.object({
  strategyType: z.string()
    .refine((val) => ['DCA', 'DCA_WITH_DMA'].includes(val), {
      message: "Invalid strategy type"
    })
    .transform((val) => val as STRATEGY_TYPE),
    
  asset: z.string()
    .refine((val) => ['BTC', 'ETH', 'HYPE'].includes(val), {
      message: "Invalid asset type"
    })
    .transform((val) => val as ASSET_TYPE),
    
  intervalAmount: z.string()
    .min(1, "Interval amount is required")
    .refine((val) => {
      try {
        const num = BigInt(val);
        return num > 0n;
      } catch {
        return false;
      }
    }, {
      message: "Interval amount must be a positive number (in wei)"
    }),
    
  intervalDays: z.string()
    .min(1, "Interval days is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), {
      message: "Interval days must be a positive integer"
    })
    .transform((val) => parseInt(val)),
    
  acceptedSlippage: z.string()
    .min(1, "Accepted slippage is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
      message: "Accepted slippage must be a number between 0 and 100"
    })
    .transform((val) => parseFloat(val)),
    
  totalAmount: z.string()
    .min(1, "Total amount is required")
    .refine((val) => {
      try {
        const num = BigInt(val);
        return num > 0n;
      } catch {
        return false;
      }
    }, {
      message: "Total amount must be a positive number (in wei)"
    })
});

// Action nonce schema (includes optional strategyId for updates)
export const actionNonceSchema = strategySchema.extend({
  action: z.string().min(1, "Action is required"),
  strategyId: z.string().optional() // For UPDATE_STRATEGY actions
});

// Type inference
export type StrategyFormData = z.infer<typeof strategyFormSchema>;
export type StrategyData = z.infer<typeof strategySchema>;
export type ActionNonceData = z.infer<typeof actionNonceSchema>;

// Utility validation functions
export const validateStrategyData = (data: unknown): StrategyData => {
  return strategySchema.parse(data);
};

export const validateFormData = (data: unknown): StrategyFormData => {
  return strategyFormSchema.parse(data);
};

export const validateActionNonceData = (data: unknown): ActionNonceData => {
  return actionNonceSchema.parse(data);
};