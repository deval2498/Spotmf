import { and, eq, gte, lte } from 'drizzle-orm'

import type { Database } from '@/db/client.ts'
import { dailyPrices, intradayPrices, type NewDailyPrice } from '@/db/schema.ts'
import { logger } from '@/lib/logger.ts'

interface DailyAggregateData {
  symbol: string
  date: string
  avgPrice: number
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  dataPoints: number
}

/**
 * Aggregates intraday data for a specific symbol and date into daily summary
 */
export async function aggregateIntradayToDaily(
  db: Database,
  symbol: string,
  date: Date
): Promise<DailyAggregateData | null> {
  try {
    // Define date range for the full day (UTC)
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // Fetch all intraday prices for the symbol within the date range
    const prices = await db.query.intradayPrices.findMany({
      where: and(
        eq(intradayPrices.symbol, symbol),
        gte(intradayPrices.timestamp, startOfDay),
        lte(intradayPrices.timestamp, endOfDay)
      ),
      orderBy: (intradayPrices, { asc }) => [asc(intradayPrices.timestamp)],
    })

    if (prices.length === 0) {
      logger.warn(
        `No intraday data found for ${symbol} on ${date.toISOString().split('T')[0]}`
      )
      return null
    }

    // Convert prices to numbers
    const priceValues = prices.map((p) => parseFloat(p.price))

    // Calculate aggregates
    const avgPrice = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length
    const openPrice = priceValues[0] // First price of the day
    const closePrice = priceValues[priceValues.length - 1] // Last price of the day
    const highPrice = Math.max(...priceValues)
    const lowPrice = Math.min(...priceValues)

    const aggregateData: DailyAggregateData = {
      symbol,
      date: startOfDay.toISOString().split('T')[0],
      avgPrice,
      openPrice,
      closePrice,
      highPrice,
      lowPrice,
      dataPoints: prices.length,
    }

    logger.info(
      `Aggregated ${prices.length} data points for ${symbol} on ${aggregateData.date}`
    )

    return aggregateData
  } catch (error) {
    logger.error(`Failed to aggregate intraday data for ${symbol}:`, error)
    throw error
  }
}

/**
 * Saves daily aggregate data to the daily_prices table
 */
export async function saveDailyAggregate(
  db: Database,
  data: DailyAggregateData,
  source: string = 'AGGREGATED'
): Promise<void> {
  try {
    const dailyRecord: NewDailyPrice = {
      symbol: data.symbol,
      date: data.date,
      avgPrice: data.avgPrice.toString(),
      openPrice: data.openPrice.toString(),
      closePrice: data.closePrice.toString(),
      highPrice: data.highPrice.toString(),
      lowPrice: data.lowPrice.toString(),
      dataPoints: data.dataPoints,
      source,
    }

    await db
      .insert(dailyPrices)
      .values(dailyRecord)
      .onConflictDoUpdate({
        target: [dailyPrices.symbol, dailyPrices.date],
        set: {
          avgPrice: dailyRecord.avgPrice,
          openPrice: dailyRecord.openPrice,
          closePrice: dailyRecord.closePrice,
          highPrice: dailyRecord.highPrice,
          lowPrice: dailyRecord.lowPrice,
          dataPoints: dailyRecord.dataPoints,
          source: dailyRecord.source,
        },
      })

    logger.info(`Saved daily aggregate for ${data.symbol} on ${data.date}`)
  } catch (error) {
    logger.error(`Failed to save daily aggregate for ${data.symbol}:`, error)
    throw error
  }
}

/**
 * Aggregates and saves daily data for a symbol on a specific date
 */
export async function processDailyAggregation(
  db: Database,
  symbol: string,
  date: Date
): Promise<boolean> {
  try {
    const aggregateData = await aggregateIntradayToDaily(db, symbol, date)

    if (!aggregateData) {
      return false
    }

    await saveDailyAggregate(db, aggregateData)
    return true
  } catch (error) {
    logger.error(`Failed to process daily aggregation for ${symbol}:`, error)
    throw error
  }
}

/**
 * Aggregates and saves daily data for all symbols for a specific date
 */
export async function processDailyAggregationForAllSymbols(
  db: Database,
  symbols: string[],
  date: Date
): Promise<number> {
  let successCount = 0

  for (const symbol of symbols) {
    try {
      const success = await processDailyAggregation(db, symbol, date)
      if (success) {
        successCount++
      }
    } catch (error) {
      logger.error(`Failed to aggregate ${symbol} for ${date.toISOString()}:`, error)
    }
  }

  logger.info(`Aggregated daily data for ${successCount}/${symbols.length} symbols`)
  return successCount
}
