/**
 * Symbol mapping configuration for price services
 *
 * Maps internal asset symbols to display symbols and CoinGecko IDs
 */

/**
 * Internal symbol -> Display symbol mapping
 * Used to normalize symbols across different price sources
 */
export const SYMBOL_MAPPING = {
  UETH: 'ETH',
  UBTC: 'BTC',
  WHYPE: 'HYPE',
} as const

/**
 * Display symbol -> CoinGecko ID mapping
 * Used for CoinGecko API requests
 */
export const COINGECKO_ID_MAPPING = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  HYPE: 'hyperliquid',
} as const

/**
 * Reverse mapping: Display symbol -> Internal symbol
 */
export const REVERSE_SYMBOL_MAPPING = {
  ETH: 'UETH',
  BTC: 'UBTC',
  HYPE: 'WHYPE',
} as const

export type InternalSymbol = keyof typeof SYMBOL_MAPPING
export type DisplaySymbol = (typeof SYMBOL_MAPPING)[InternalSymbol]
export type CoinGeckoId = (typeof COINGECKO_ID_MAPPING)[DisplaySymbol]
