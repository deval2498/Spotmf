import { COINGECKO_RATE_LIMIT_DELAY, delay } from '@/lib/delay.ts'
import { logger } from '@/lib/logger.ts'
import {
  COINGECKO_ID_MAPPING,
  type DisplaySymbol,
  type InternalSymbol,
  REVERSE_SYMBOL_MAPPING,
  SYMBOL_MAPPING,
} from '@/services/pricing/configs/symbol-mapping.ts'

interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    usd: number
  }
}

/**
 * Service for fetching cryptocurrency prices from CoinGecko API
 */
export class CoinGeckoPriceService {
  private apiKey?: string
  private baseUrl = 'https://api.coingecko.com/api/v3'

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  /**
   * Fetches current price for a single symbol from CoinGecko
   */
  async getCurrentPrice(symbol: InternalSymbol): Promise<number> {
    try {
      const displaySymbol = SYMBOL_MAPPING[symbol]
      const coinGeckoId = COINGECKO_ID_MAPPING[displaySymbol]

      const params = new URLSearchParams({
        ids: coinGeckoId,
        vs_currencies: 'usd',
      })

      const url = `${this.baseUrl}/simple/price?${params.toString()}`

      const headers: Record<string, string> = {
        accept: 'application/json',
      }

      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as CoinGeckoSimplePriceResponse

      if (!data[coinGeckoId] || typeof data[coinGeckoId].usd !== 'number') {
        throw new Error(`No price data returned for ${symbol} (${coinGeckoId})`)
      }

      const price = data[coinGeckoId].usd

      logger.info(`${symbol} price from CoinGecko: ${price.toFixed(6)}`)

      return price
    } catch (error) {
      logger.error(`Failed to fetch price for ${symbol} from CoinGecko:`, error)
      throw error
    }
  }

  /**
   * Fetches current prices for all configured symbols from CoinGecko
   */
  async getAllCurrentPrices(): Promise<Record<InternalSymbol, number>> {
    try {
      // Get all CoinGecko IDs
      const symbols = Object.keys(SYMBOL_MAPPING) as InternalSymbol[]
      const coinGeckoIds = symbols.map((sym) => {
        const displaySym = SYMBOL_MAPPING[sym]
        return COINGECKO_ID_MAPPING[displaySym]
      })

      const params = new URLSearchParams({
        ids: coinGeckoIds.join(','),
        vs_currencies: 'usd',
      })

      const url = `${this.baseUrl}/simple/price?${params.toString()}`

      const headers: Record<string, string> = {
        accept: 'application/json',
      }

      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as CoinGeckoSimplePriceResponse

      // Map CoinGecko IDs back to internal symbols
      const prices: Partial<Record<InternalSymbol, number>> = {}

      for (const [coinGeckoId, priceData] of Object.entries(data)) {
        if (priceData && typeof priceData.usd === 'number') {
          // Find the display symbol for this CoinGecko ID
          const displaySymbol = Object.entries(COINGECKO_ID_MAPPING).find(
            ([, id]) => id === coinGeckoId
          )?.[0] as DisplaySymbol | undefined

          if (displaySymbol && displaySymbol in REVERSE_SYMBOL_MAPPING) {
            const internalSymbol = REVERSE_SYMBOL_MAPPING[displaySymbol]
            prices[internalSymbol] = priceData.usd
            logger.info(
              `${internalSymbol} price from CoinGecko: ${priceData.usd.toFixed(6)}`
            )
          }
        }
      }

      return prices as Record<InternalSymbol, number>
    } catch (error) {
      logger.error('Failed to fetch prices from CoinGecko:', error)
      throw error
    }
  }

  /**
   * Health check for CoinGecko service
   */
  async healthCheck(): Promise<{
    status: string
    symbolsChecked: number
    errors: string[]
  }> {
    const errors: string[] = []
    let symbolsChecked = 0

    const symbols = Object.keys(SYMBOL_MAPPING) as InternalSymbol[]

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]

      try {
        await this.getCurrentPrice(symbol)
        symbolsChecked++

        // Add delay between API calls to avoid rate limiting
        // Skip delay after the last symbol
        if (i < symbols.length - 1) {
          await delay(COINGECKO_RATE_LIMIT_DELAY)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        errors.push(`${symbol}: ${errorMessage}`)

        // Still add delay even on error to avoid rate limiting
        if (i < symbols.length - 1) {
          await delay(COINGECKO_RATE_LIMIT_DELAY)
        }
      }
    }

    return {
      status: errors.length === 0 ? 'healthy' : 'partial',
      symbolsChecked,
      errors,
    }
  }
}
