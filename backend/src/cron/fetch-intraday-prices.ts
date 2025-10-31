import cron from 'node-cron'

import { db } from '@/db/client.ts'
import { logger } from '@/lib/logger.ts'
import {
  CoinGeckoPriceService,
  HyperswapPriceService,
  saveIntradayPrices,
} from '@/services/pricing/index.ts'

/**
 * Fetches current prices from multiple sources and stores them as intraday prices
 */
async function fetchAndStoreIntradayPrices(
  hyperswapService: HyperswapPriceService,
  coinGeckoService: CoinGeckoPriceService
): Promise<void> {
  try {
    logger.info('Fetching current prices from multiple sources...')
    const timestamp = new Date()

    // Fetch from Hyperswap (DEX)
    let dexRecords: Array<{
      symbol: string
      price: number
      timestamp: Date
      source: string
    }> = []

    try {
      const dexPrices = await hyperswapService.getAllCurrentPoolPrices()
      dexRecords = Object.entries(dexPrices).map(([asset, price]) => ({
        symbol: asset,
        price,
        timestamp,
        source: 'DEX',
      }))
      logger.info(`Fetched ${dexRecords.length} prices from Hyperswap`)
    } catch (error) {
      logger.error('Failed to fetch prices from Hyperswap:', error)
    }

    // Fetch from CoinGecko
    let cgRecords: Array<{
      symbol: string
      price: number
      timestamp: Date
      source: string
    }> = []

    try {
      const cgPrices = await coinGeckoService.getAllCurrentPrices()
      cgRecords = Object.entries(cgPrices).map(([asset, price]) => ({
        symbol: asset,
        price,
        timestamp,
        source: 'COINGECKO',
      }))
      logger.info(`Fetched ${cgRecords.length} prices from CoinGecko`)
    } catch (error) {
      logger.error('Failed to fetch prices from CoinGecko:', error)
    }

    // Store all prices from both sources
    const allRecords = [...dexRecords, ...cgRecords]

    if (allRecords.length > 0) {
      await saveIntradayPrices(db, allRecords)
      logger.info(
        `Stored ${allRecords.length} intraday price records from multiple sources`
      )
    } else {
      logger.warn('No prices fetched from any source')
    }
  } catch (error) {
    logger.error('Failed to fetch and store intraday prices:', error)
  }
}

/**
 * Starts the 5-minute intraday price fetching cron job
 */
export function startIntradayPriceFetchJob(
  hyperswapService: HyperswapPriceService,
  coinGeckoService: CoinGeckoPriceService,
  intervalMinutes: number = 5
): cron.ScheduledTask {
  logger.info(`Starting intraday price fetch job (every ${intervalMinutes} minutes)`)

  // Fetch immediately on start
  fetchAndStoreIntradayPrices(hyperswapService, coinGeckoService)

  // Schedule job to run every N minutes
  const cronExpression = `*/${intervalMinutes} * * * *`

  const task = cron.schedule(cronExpression, () => {
    fetchAndStoreIntradayPrices(hyperswapService, coinGeckoService)
  })

  return task
}

/**
 * Stops the intraday price fetch job
 */
export function stopIntradayPriceFetchJob(task: cron.ScheduledTask): void {
  if (task) {
    task.stop()
    logger.info('Stopped intraday price fetch job')
  }
}
