import cron from 'node-cron'

import { db } from '@/db/client.ts'
import { logger } from '@/lib/logger.ts'
import { processDailyAggregationForAllSymbols } from '@/services/pricing/index.ts'

/**
 * Aggregates the previous day's intraday data into daily summaries
 */
async function aggregatePreviousDayPrices(symbols: string[]): Promise<void> {
  try {
    logger.info('Starting daily price aggregation...')

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    const successCount = await processDailyAggregationForAllSymbols(
      db,
      symbols,
      yesterday
    )

    logger.info(
      `Daily aggregation completed: ${successCount}/${symbols.length} symbols processed`
    )
  } catch (error) {
    logger.error('Failed to aggregate daily prices:', error)
  }
}

/**
 * Starts the daily aggregation cron job (runs at 00:05 UTC)
 */
export function startDailyAggregationJob(symbols: string[]): cron.ScheduledTask {
  logger.info('Starting daily price aggregation job (00:05 UTC daily)')

  // Schedule job to run at 00:05 UTC every day
  const cronExpression = '5 0 * * *'

  const task = cron.schedule(
    cronExpression,
    () => {
      aggregatePreviousDayPrices(symbols)
    },
    {
      timezone: 'UTC',
    }
  )

  return task
}

/**
 * Stops the daily aggregation job
 */
export function stopDailyAggregationJob(task: cron.ScheduledTask): void {
  if (task) {
    task.stop()
    logger.info('Stopped daily aggregation job')
  }
}
