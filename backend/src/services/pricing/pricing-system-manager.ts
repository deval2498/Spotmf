import type { ScheduledTask } from 'node-cron'

import {
  startCleanupJob,
  startDailyAggregationJob,
  startIntradayPriceFetchJob,
  stopCleanupJob,
  stopDailyAggregationJob,
  stopIntradayPriceFetchJob,
} from '@/cron/index.ts'
import { db } from '@/db/client.ts'
import { logger } from '@/lib/logger.ts'
import { ensureDailyDataForAllSymbols } from '@/services/pricing/backfill-service.ts'
import { HYPEREVM_POOL_CONFIGS } from '@/services/pricing/configs/pool-config.ts'
import { CoinGeckoPriceService } from '@/services/pricing/sources/coingecko-service.ts'
import { HyperswapPriceService } from '@/services/pricing/sources/hyperswap-service.ts'

interface PricingSystemConfig {
  rpcUrl: string
  coinGeckoApiKey?: string
  fetchIntervalMinutes?: number
}

/**
 * Manages the entire pricing system: intraday fetching, daily aggregation, and cleanup
 */
export class PricingSystemManager {
  private priceService: HyperswapPriceService
  private coinGeckoService: CoinGeckoPriceService
  private fetchTask?: ScheduledTask
  private aggregationTask?: ScheduledTask
  private cleanupTask?: ScheduledTask
  private isRunning = false

  constructor(private config: PricingSystemConfig) {
    this.priceService = new HyperswapPriceService(
      db,
      config.rpcUrl,
      HYPEREVM_POOL_CONFIGS
    )
    this.coinGeckoService = new CoinGeckoPriceService(config.coinGeckoApiKey)
  }

  /**
   * Starts the complete pricing system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Pricing system already running')
      return
    }

    try {
      logger.info('Starting pricing system...')

      // Step 1: Validate pool configurations
      await this.validatePoolConfigurations()

      // Step 2: Validate CoinGecko service
      await this.validateCoinGeckoService()

      // Step 3: Backfill historical daily data
      await this.ensureHistoricalData()

      // Step 4: Start cron jobs
      this.startCronJobs()

      this.isRunning = true
      logger.info('Pricing system started successfully')
    } catch (error) {
      logger.error('Failed to start pricing system:', error)
      throw error
    }
  }

  /**
   * Stops the pricing system
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    logger.info('Stopping pricing system...')

    if (this.fetchTask) {
      stopIntradayPriceFetchJob(this.fetchTask)
    }

    if (this.aggregationTask) {
      stopDailyAggregationJob(this.aggregationTask)
    }

    if (this.cleanupTask) {
      stopCleanupJob(this.cleanupTask)
    }

    this.isRunning = false
    logger.info('Pricing system stopped')
  }

  /**
   * Gets the current status of the pricing system
   */
  getStatus(): {
    isRunning: boolean
    hasActiveTasks: boolean
    poolCount: number
  } {
    return {
      isRunning: this.isRunning,
      hasActiveTasks: !!(this.fetchTask || this.aggregationTask || this.cleanupTask),
      poolCount: HYPEREVM_POOL_CONFIGS.length,
    }
  }

  /**
   * Validates all pool configurations
   */
  private async validatePoolConfigurations(): Promise<void> {
    logger.info('Validating pool configurations...')

    for (const poolConfig of HYPEREVM_POOL_CONFIGS) {
      const isValid = await this.priceService.validatePoolConfig(poolConfig)
      if (!isValid) {
        throw new Error(`Invalid pool configuration for ${poolConfig.asset}`)
      }
    }

    logger.info('All pool configurations validated')
  }

  /**
   * Validates CoinGecko service connectivity
   */
  private async validateCoinGeckoService(): Promise<void> {
    logger.info('Validating CoinGecko service...')

    const health = await this.coinGeckoService.healthCheck()

    if (health.status !== 'healthy') {
      logger.warn('CoinGecko service has issues:', health.errors)
    } else {
      logger.info('CoinGecko service validated successfully')
    }
  }

  /**
   * Ensures 1 year of historical daily data is available
   */
  private async ensureHistoricalData(): Promise<void> {
    logger.info('Ensuring historical data completeness...')

    // Map pool configs to symbol/coinGeckoId pairs
    const symbolMapping = HYPEREVM_POOL_CONFIGS.map((config) => ({
      symbol: config.asset,
      coinGeckoId: config.assetName,
    }))

    await ensureDailyDataForAllSymbols(
      db,
      symbolMapping,
      365,
      this.config.coinGeckoApiKey
    )

    logger.info('Historical data check completed')
  }

  /**
   * Starts all cron jobs
   */
  private startCronJobs(): void {
    const symbols = HYPEREVM_POOL_CONFIGS.map((config) => config.asset)
    const fetchInterval = this.config.fetchIntervalMinutes || 5

    // Start 5-minute intraday price fetching
    this.fetchTask = startIntradayPriceFetchJob(
      this.priceService,
      this.coinGeckoService,
      fetchInterval
    )

    // Start daily aggregation at 00:05 UTC
    this.aggregationTask = startDailyAggregationJob(symbols)

    // Start cleanup at 00:30 UTC
    this.cleanupTask = startCleanupJob()

    logger.info('All cron jobs started')
  }
}
