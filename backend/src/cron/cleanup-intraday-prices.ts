import cron from 'node-cron'

import { db } from '@/db/client.ts'
import { logger } from '@/lib/logger.ts'
import { cleanupOldIntradayPrices } from '@/services/pricing/index.ts'

/**
 * Cleans up intraday prices older than 24 hours
 */
async function cleanupOldPrices(): Promise<void> {
  try {
    logger.info('Starting cleanup of old intraday prices...')

    const deletedCount = await cleanupOldIntradayPrices(db, 24)

    logger.info(`Cleanup completed: ${deletedCount} old records deleted`)
  } catch (error) {
    logger.error('Failed to cleanup old intraday prices:', error)
  }
}

/**
 * Starts the cleanup cron job (runs at 00:30 UTC daily, after aggregation)
 */
export function startCleanupJob(): cron.ScheduledTask {
  logger.info('Starting intraday price cleanup job (00:30 UTC daily)')

  // Schedule job to run at 00:30 UTC every day (after aggregation at 00:05)
  const cronExpression = '30 0 * * *'

  const task = cron.schedule(
    cronExpression,
    () => {
      cleanupOldPrices()
    },
    {
      timezone: 'UTC',
    }
  )

  return task
}

/**
 * Stops the cleanup job
 */
export function stopCleanupJob(task: cron.ScheduledTask): void {
  if (task) {
    task.stop()
    logger.info('Stopped cleanup job')
  }
}
