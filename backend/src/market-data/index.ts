// src/market-data/index.ts - Main entry point
import { PriceJobManager } from '@/market-data/services/price-job-manager.ts'

let priceJobManager: PriceJobManager

export async function initializePriceCollection(): Promise<void> {
  try {
    priceJobManager = new PriceJobManager()
    await priceJobManager.start()
  } catch (error) {
    console.error('Failed to initialize price collection:', error)
    process.exit(1)
  }
}

export async function stopPriceCollection(): Promise<void> {
  if (priceJobManager) {
    await priceJobManager.stop()
  }
}

export function getPriceJobManager(): PriceJobManager {
  return priceJobManager
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM received - shutting down price collection...')
  await stopPriceCollection()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('📡 SIGINT received - shutting down price collection...')
  await stopPriceCollection()
  process.exit(0)
})
