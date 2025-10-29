import { and, eq } from 'drizzle-orm'
import { ethers } from 'ethers'

import type { Database } from '@/db/client.ts'
import { historicalPrices, priceCache } from '@/db/schema.ts'
import HyperswapPool from '@/market-data/abis/HyperswapV3Pool.json' with { type: 'json' }
import type { PoolConfig } from '@/market-data/types/market-data.types.ts'

export class HyperswapPriceService {
  private provider: ethers.JsonRpcProvider

  constructor(
    private db: Database,
    rpcUrl: string,
    private poolConfigs: PoolConfig[]
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
  }

  async getCurrentPoolPrices(asset: string): Promise<number> {
    const poolConfig = this.poolConfigs.find((p) => p.asset === asset)
    if (!poolConfig) {
      throw new Error(`No pool configuration found: ${asset}`)
    }
    try {
      const poolContract = new ethers.Contract(
        poolConfig.address,
        HyperswapPool.abi,
        this.provider
      )
      const [sqrtPriceX96] = await poolContract.slot0()
      const price = this.sqrtPriceX96ToDecimal(
        sqrtPriceX96,
        poolConfig.token0Decimals,
        poolConfig.token1Decimals,
        poolConfig.pricePerToken
      )
      console.log(`💰 ${asset} price from pool: ${price.toFixed(6)}`)
      return price
    } catch (error) {
      console.error(`Failed to fetch price for ${asset} from pool:`, error)
      throw error
    }
  }

  async getAllCurrentPoolPrices(): Promise<Record<string, number>> {
    const prices: Record<string, number> = {}

    for (const poolConfig of this.poolConfigs) {
      try {
        prices[poolConfig.asset] = await this.getCurrentPoolPrices(poolConfig.asset)
      } catch {
        console.log('Failed to fetch price of asset,', poolConfig.asset)
      }
    }

    return prices
  }

  async saveCurrentPrices(): Promise<void> {
    console.log('Fetching and saving prices from hyperswap')
    try {
      const prices = await this.getAllCurrentPoolPrices()
      const timestamp = new Date()
      for (const [asset, price] of Object.entries(prices)) {
        const poolConfig = this.poolConfigs.find((p) => asset === p.asset)
        if (!poolConfig) {
          throw Error('Pool config not found')
        }
        await this.db.insert(priceCache).values({
          asset: asset as any,
          timestamp,
          price: price.toString(),
          source: 'DEX',
        })
        await this.saveAsHistoricalPrice(asset, price, timestamp)
      }
    } catch (error) {
      console.error('Failed to save current prices:', error)
      throw error
    }
  }

  async healthCheck(): Promise<{
    status: string
    poolsChecked: number
    errors: string[]
  }> {
    const errors: string[] = []
    let poolsChecked = 0

    for (const poolConfig of this.poolConfigs) {
      try {
        await this.getCurrentPoolPrices(poolConfig.asset)
        poolsChecked++
      } catch (error: any) {
        errors.push(`${poolConfig.asset}: ${error.message}`)
      }
    }

    return {
      status: errors.length === 0 ? 'healthy' : 'partial',
      poolsChecked,
      errors,
    }
  }

  async validatePoolConfig(poolConfig: PoolConfig): Promise<boolean> {
    try {
      const poolContract = new ethers.Contract(
        poolConfig.address,
        HyperswapPool.abi,
        this.provider
      )

      const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
      ])

      console.log(`Pool ${poolConfig.asset}:`, {
        address: poolConfig.address,
        token0: token0.toLowerCase(),
        token1: token1.toLowerCase(),
        fee: fee.toString(),
        expectedToken0: poolConfig.token0.toLowerCase(),
        expectedToken1: poolConfig.token1.toLowerCase(),
      })

      const token0Match = token0.toLowerCase() === poolConfig.token0.toLowerCase()
      const token1Match = token1.toLowerCase() === poolConfig.token1.toLowerCase()

      if (!token0Match || !token1Match) {
        console.error(`❌ Pool configuration mismatch for ${poolConfig.asset}`)
        return false
      }

      console.log(`✅ Pool configuration valid for ${poolConfig.asset}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to validate pool config for ${poolConfig.asset}:`, error)
      return false
    }
  }

  private async saveAsHistoricalPrice(
    asset: string,
    price: number,
    timestamp: Date
  ): Promise<void> {
    const dateOnly = new Date(
      timestamp.getFullYear(),
      timestamp.getMonth(),
      timestamp.getDate()
    )

    // Check if record exists
    const existing = await this.db.query.historicalPrices.findFirst({
      where: and(
        eq(historicalPrices.asset, asset as any),
        eq(historicalPrices.date, dateOnly.toISOString().split('T')[0])
      ),
    })

    if (existing) {
      // Update existing record
      await this.db
        .update(historicalPrices)
        .set({
          price: price.toString(),
          source: 'DEX',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(historicalPrices.asset, asset as any),
            eq(historicalPrices.date, dateOnly.toISOString().split('T')[0])
          )
        )
    } else {
      // Insert new record
      await this.db.insert(historicalPrices).values({
        asset: asset as any,
        date: dateOnly.toISOString().split('T')[0],
        price: price.toString(),
        source: 'DEX',
      })
    }
  }

  private sqrtPriceX96ToDecimal(
    sqrtPriceX96: ethers.BigNumberish,
    token0Decimals: number,
    token1Decimals: number,
    pricePerToken: 'T1' | 'T0'
  ) {
    try {
      // Constants
      console.log('Trying to convert,', sqrtPriceX96, token0Decimals)
      const Q96 = 2n ** 96n
      const PRECISION = 10n ** 18n
      // Convert sqrtPriceX96 to price
      const sqrtPrice =
        pricePerToken === 'T0'
          ? (BigInt(sqrtPriceX96) * PRECISION) / Q96
          : (Q96 * PRECISION) / BigInt(sqrtPriceX96)
      const price = (sqrtPrice * sqrtPrice) / PRECISION
      // Adjust for decimal differences
      // If token0 has more decimals, price needs to be adjusted down
      const decimalDifference =
        pricePerToken === 'T0'
          ? token0Decimals - token1Decimals
          : token1Decimals - token0Decimals
      let adjustedPrice: bigint

      if (decimalDifference > 0) {
        adjustedPrice = price * 10n ** BigInt(decimalDifference)
      } else if (decimalDifference < 0) {
        adjustedPrice = price / 10n ** BigInt(-decimalDifference)
      } else {
        adjustedPrice = price
      }
      // Convert to number with proper decimals
      const divisor = 10n ** BigInt(18n)
      const wholePart = adjustedPrice / divisor
      const fractionalPart = adjustedPrice % divisor
      // Combine whole and fractional parts
      const result = Number(wholePart) + Number(fractionalPart) / Number(divisor)
      return result
    } catch (error) {
      console.error('Error converting sqrtPriceX96 to price:', error)
      throw new Error('Failed to convert pool price')
    }
  }
}
