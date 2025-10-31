/**
 * Utility function to add delays for rate limiting
 */

/**
 * Delays execution for specified milliseconds
 * @param ms Milliseconds to wait
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Standard delay for API rate limiting (3 seconds)
 */
export const API_RATE_LIMIT_DELAY = 3000

/**
 * Delay for CoinGecko API calls to avoid rate limiting
 * Free tier: 10-30 calls/minute, so ~2-3 seconds between calls is safe
 */
export const COINGECKO_RATE_LIMIT_DELAY = 3000
