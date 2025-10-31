import { logger } from '@/lib/logger.ts'
import { PricingSystemManager } from '@/services/pricing/index.ts'

let pricingSystem: PricingSystemManager

async function startWorker() {
  try {
    logger.info('Starting Enhanced Worker...')

    // Initialize the new pricing system
    pricingSystem = new PricingSystemManager({
      rpcUrl: process.env.HYPEREVM_RPC_URL!,
      coinGeckoApiKey: process.env.COINGECKO_API_KEY,
      fetchIntervalMinutes: parseInt(
        process.env.PRICE_COLLECTION_INTERVAL_MINUTES || '5'
      ),
    })

    await pricingSystem.start()

    // TODO: Add other worker services here
    // - Strategy execution engine
    // - Event processing
    // - etc.

    logger.info('Enhanced Worker started successfully')
  } catch (error) {
    logger.error('Failed to start enhanced worker:', error)
    process.exit(1)
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received - shutting down worker...')
  if (pricingSystem) {
    await pricingSystem.stop()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received - shutting down worker...')
  if (pricingSystem) {
    await pricingSystem.stop()
  }
  process.exit(0)
})

startWorker()
