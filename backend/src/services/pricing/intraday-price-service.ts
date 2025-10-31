import { and, lt } from 'drizzle-orm'

import type { Database } from '@/db/client.ts'
import { intradayPrices, type NewIntradayPrice } from '@/db/schema.ts'
import { logger } from '@/lib/logger.ts'

/**
 * Stores a single intraday price data point
 */
export async function saveIntradayPrice(
  db: Database,
  data: {
    symbol: string
    price: number
    timestamp: Date
    source?: string
  }
): Promise<void> {
  try {
    const priceRecord: NewIntradayPrice = {
      symbol: data.symbol,
      price: data.price.toString(),
      timestamp: data.timestamp,
      source: data.source || 'DEX',
    }

    await db.insert(intradayPrices).values(priceRecord).onConflictDoNothing()

    logger.info(`Saved intraday price for ${data.symbol}: $${data.price.toFixed(6)}`)
  } catch (error) {
    logger.error(`Failed to save intraday price for ${data.symbol}:`, error)
    throw error
  }
}

/**
 * Stores multiple intraday price data points in batch
 */
export async function saveIntradayPrices(
  db: Database,
  prices: Array<{
    symbol: string
    price: number
    timestamp: Date
    source?: string
  }>
): Promise<void> {
  if (prices.length === 0) {
    return
  }

  try {
    const priceRecords: NewIntradayPrice[] = prices.map((data) => ({
      symbol: data.symbol,
      price: data.price.toString(),
      timestamp: data.timestamp,
      source: data.source || 'DEX',
    }))

    await db.insert(intradayPrices).values(priceRecords).onConflictDoNothing()

    logger.info(`Saved ${prices.length} intraday price records`)
  } catch (error) {
    logger.error('Failed to save intraday prices:', error)
    throw error
  }
}

/**
 * Cleans up intraday prices older than specified hours (default 24h)
 */
export async function cleanupOldIntradayPrices(
  db: Database,
  hoursToRetain: number = 24
): Promise<number> {
  try {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hoursToRetain)

    const result = await db
      .delete(intradayPrices)
      .where(lt(intradayPrices.timestamp, cutoffTime))

    const deletedCount = result.rowCount || 0
    logger.info(`Cleaned up ${deletedCount} old intraday price records`)

    return deletedCount
  } catch (error) {
    logger.error('Failed to cleanup old intraday prices:', error)
    throw error
  }
}

/**
 * Gets intraday prices for a symbol within a date range
 */
export async function getIntradayPrices(
  db: Database,
  symbol: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const prices = await db.query.intradayPrices.findMany({
      where: and(
        lt(intradayPrices.timestamp, endDate),
        lt(startDate, intradayPrices.timestamp)
      ),
      orderBy: (intradayPrices, { asc }) => [asc(intradayPrices.timestamp)],
    })

    return prices
  } catch (error) {
    logger.error(`Failed to fetch intraday prices for ${symbol}:`, error)
    throw error
  }
}
