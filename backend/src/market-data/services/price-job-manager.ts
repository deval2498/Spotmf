import dotenv from 'dotenv'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, '../../.env'), // adjust as needed
})
import { db } from '@/db/client.ts'
import { HYPEREVM_POOL_CONFIGS } from '@/market-data/configs/pool-config.ts'
import { PriceCollectionJob } from '@/market-data/jobs/price-collection-job.ts'
import { HistoricalDataManager } from '@/market-data/services/historical-data-manager.ts'
import { HyperswapPriceService } from '@/market-data/services/hyperswap-price-service.ts'

export class PriceJobManager {
  private priceService!: HyperswapPriceService
  private priceJob!: PriceCollectionJob
  private isInitialized = false
  private historicalPriceService!: HistoricalDataManager

  constructor() {
    this.initializeJob()
  }

  private initializeJob(): void {
    this.priceService = new HyperswapPriceService(
      db,
      process.env.HYPEREVM_RPC_URL!,
      HYPEREVM_POOL_CONFIGS
    )
    this.historicalPriceService = new HistoricalDataManager(db, HYPEREVM_POOL_CONFIGS)
    this.priceJob = new PriceCollectionJob(this.priceService)
  }

  async start(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Price collection already running')
      return
    }

    try {
      this.isInitialized = true
      console.log('🚀 Starting price collection system...')

      // Validate pool configurations
      await this.validatePoolConfigurations()

      await this.historicalPriceService.ensureHistoricalData()
      // Test price fetching
      await this.testPriceFetching()

      // Start the collection job
      const intervalMinutes = parseInt(
        process.env.PRICE_COLLECTION_INTERVAL_MINUTES || '5'
      )
      this.priceJob.start(intervalMinutes)

      this.isInitialized = true
      console.log(`✅ Price collection system started (${intervalMinutes}min intervals)`)
    } catch (error) {
      console.error('❌ Failed to start price collection system:', error)
      throw error
    }
  }

  private async testPriceFetching(): Promise<void> {
    console.log('🧪 Testing price fetching...')

    try {
      const prices = await this.priceService.getAllCurrentPoolPrices()
      const assetCount = Object.keys(prices).length

      if (assetCount === 0) {
        throw new Error('No prices could be fetched')
      }

      console.log(`✅ Successfully fetched prices for ${assetCount} assets:`, prices)
    } catch (error) {
      console.error('❌ Price fetching test failed:', error)
      throw error
    }
  }

  async getStatus(): Promise<{
    isRunning: boolean
    pools: number
    lastPrices: Record<string, number>
    health: any
  }> {
    const lastPrices = this.isInitialized
      ? await this.priceService.getAllCurrentPoolPrices()
      : {}

    const health = this.isInitialized
      ? await this.priceService.healthCheck()
      : { status: 'stopped', poolsChecked: 0, errors: ['Not initialized'] }

    return {
      isRunning: this.isInitialized,
      pools: HYPEREVM_POOL_CONFIGS.length,
      lastPrices,
      health,
    }
  }

  private async validatePoolConfigurations(): Promise<void> {
    console.log('🔍 Validating pool configurations...')

    for (const poolConfig of HYPEREVM_POOL_CONFIGS) {
      const isValid = await this.priceService.validatePoolConfig(poolConfig)
      if (!isValid) {
        throw new Error(`Invalid pool configuration for ${poolConfig.asset}`)
      }
    }

    console.log('✅ All pool configurations validated')
  }

  async stop(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    console.log('🛑 Stopping price collection system...')

    // Stop the job
    this.priceJob.stop()

    this.isInitialized = false
    console.log('✅ Price collection system stopped')
  }
}
