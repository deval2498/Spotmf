import { and, eq, gte, lte } from 'drizzle-orm'

import type { Database } from '@/db/client.ts'
import { dailyPrices, type NewDailyPrice } from '@/db/schema.ts'
import { COINGECKO_RATE_LIMIT_DELAY, delay } from '@/lib/delay.ts'
import { logger } from '@/lib/logger.ts'

interface CoinGeckoMarketChartResponse {
  prices: Array<[number, number]> // [timestamp, price]
}

/**
 * Fetches historical price data from CoinGecko for a date range
 */
async function fetchCoinGeckoHistoricalData(
  coinId: string,
  startTimestamp: number,
  endTimestamp: number,
  apiKey?: string
): Promise<CoinGeckoMarketChartResponse> {
  try {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      from: startTimestamp.toString(),
      to: endTimestamp.toString(),
    })

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?${params.toString()}`

    const headers: Record<string, string> = {
      accept: 'application/json',
    }

    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    logger.error(`Failed to fetch data from CoinGecko for ${coinId}:`, error)
    throw error
  }
}

/**
 * Generates a list of dates between start and end date
 */
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  current.setUTCHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

/**
 * Gets missing dates for a symbol within the specified date range
 */
export async function getMissingDatesForSymbol(
  db: Database,
  symbol: string,
  daysToCheck: number = 365
): Promise<Date[]> {
  try {
    const endDate = new Date()
    endDate.setUTCHours(0, 0, 0, 0)
    endDate.setUTCDate(endDate.getUTCDate() - 1) // Yesterday

    const startDate = new Date(endDate)
    startDate.setUTCDate(startDate.getUTCDate() - daysToCheck)

    // Fetch existing daily prices for the symbol
    const existingPrices = await db.query.dailyPrices.findMany({
      where: and(
        eq(dailyPrices.symbol, symbol),
        gte(dailyPrices.date, startDate.toISOString().split('T')[0]),
        lte(dailyPrices.date, endDate.toISOString().split('T')[0])
      ),
    })

    const existingDates = new Set(
      existingPrices.map((record) => new Date(record.date).toISOString().split('T')[0])
    )

    const expectedDates = generateDateRange(startDate, endDate)
    const missingDates = expectedDates.filter(
      (date) => !existingDates.has(date.toISOString().split('T')[0])
    )

    if (missingDates.length > 0) {
      logger.info(`Found ${missingDates.length} missing dates for ${symbol}`)
    }

    return missingDates
  } catch (error) {
    logger.error(`Failed to check missing dates for ${symbol}:`, error)
    throw error
  }
}

/**
 * Backfills daily price data from CoinGecko for missing dates
 */
export async function backfillDailyData(
  db: Database,
  symbol: string,
  coinGeckoId: string,
  missingDates: Date[],
  apiKey?: string
): Promise<number> {
  if (missingDates.length === 0) {
    return 0
  }

  try {
    // Find min and max dates to minimize API calls
    const timestamps = missingDates.map((d) => d.getTime())
    const minTimestamp = Math.min(...timestamps)
    const maxTimestamp = Math.max(...timestamps)

    logger.info(
      `Backfilling ${missingDates.length} days for ${symbol} from CoinGecko (${coinGeckoId})`
    )

    // Fetch data from CoinGecko
    const data = await fetchCoinGeckoHistoricalData(
      coinGeckoId,
      Math.floor(minTimestamp / 1000),
      Math.floor(maxTimestamp / 1000),
      apiKey
    )

    if (!data.prices || data.prices.length === 0) {
      logger.warn(`No price data returned from CoinGecko for ${symbol}`)
      return 0
    }

    // Convert CoinGecko data to daily prices
    // CoinGecko returns data at specific timestamps, we need to map them to dates
    const dailyData: NewDailyPrice[] = data.prices.map(([timestamp, price]) => {
      const date = new Date(timestamp)
      date.setUTCHours(0, 0, 0, 0)

      return {
        symbol,
        date: date.toISOString().split('T')[0],
        avgPrice: price.toString(),
        openPrice: price.toString(),
        closePrice: price.toString(),
        highPrice: price.toString(),
        lowPrice: price.toString(),
        dataPoints: 1,
        source: 'COINGECKO',
      }
    })

    // Insert data
    let insertedCount = 0
    for (const record of dailyData) {
      try {
        await db.insert(dailyPrices).values(record).onConflictDoNothing()

        insertedCount++
      } catch (error) {
        logger.error(
          `Failed to insert daily price for ${symbol} on ${record.date}:`,
          error
        )
      }
    }

    logger.info(`Backfilled ${insertedCount} daily price records for ${symbol}`)
    return insertedCount
  } catch (error) {
    logger.error(`Failed to backfill daily data for ${symbol}:`, error)
    throw error
  }
}

/**
 * Ensures complete daily price data for a symbol (checks and backfills if needed)
 */
export async function ensureDailyDataForSymbol(
  db: Database,
  symbol: string,
  coinGeckoId: string,
  daysToCheck: number = 365,
  apiKey?: string
): Promise<boolean> {
  try {
    logger.info(`Checking daily data completeness for ${symbol}...`)

    const missingDates = await getMissingDatesForSymbol(db, symbol, daysToCheck)

    if (missingDates.length === 0) {
      logger.info(`Daily data is complete for ${symbol}`)
      return true
    }

    await backfillDailyData(db, symbol, coinGeckoId, missingDates, apiKey)
    return true
  } catch (error) {
    logger.error(`Failed to ensure daily data for ${symbol}:`, error)
    return false
  }
}

/**
 * Ensures complete daily price data for all symbols
 */
export async function ensureDailyDataForAllSymbols(
  db: Database,
  symbolMapping: Array<{ symbol: string; coinGeckoId: string }>,
  daysToCheck: number = 365,
  apiKey?: string
): Promise<number> {
  let successCount = 0

  for (let i = 0; i < symbolMapping.length; i++) {
    const { symbol, coinGeckoId } = symbolMapping[i]

    try {
      const success = await ensureDailyDataForSymbol(
        db,
        symbol,
        coinGeckoId,
        daysToCheck,
        apiKey
      )
      if (success) {
        successCount++
      }

      // Add delay between symbols to avoid CoinGecko rate limiting
      // Skip delay after the last symbol
      if (i < symbolMapping.length - 1) {
        logger.info(
          `Waiting ${COINGECKO_RATE_LIMIT_DELAY / 1000}s before next symbol to avoid rate limiting...`
        )
        await delay(COINGECKO_RATE_LIMIT_DELAY)
      }
    } catch (error) {
      logger.error(`Failed to ensure daily data for ${symbol}:`, error)

      // Still add delay even on error to avoid rate limiting
      if (i < symbolMapping.length - 1) {
        await delay(COINGECKO_RATE_LIMIT_DELAY)
      }
    }
  }

  logger.info(`Ensured daily data for ${successCount}/${symbolMapping.length} symbols`)
  return successCount
}
