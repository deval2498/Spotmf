import { and, eq, gte, lte } from 'drizzle-orm'

import type { Database } from '@/db/client.ts'
import { type HistoricalPrice, historicalPrices } from '@/db/schema.ts'
import { PoolConfig } from '@/market-data/types/market-data.types.ts'

type MissingDataMap = Record<string, number[]>

export class HistoricalDataManager {
  private readonly DAYS_TO_CHECK = 365
  constructor(
    private db: Database,
    private assetConfig: PoolConfig[]
  ) {}

  async ensureHistoricalData(): Promise<void> {
    console.log('Checking historical data completeness......')
    try {
      const assets = this.getAllAssetsFromConfig()
      const missingData = await this.getMissingDataFromDB(assets)
      if (Object.keys(missingData).length === 0) {
        console.log('Data is complete.')
        return
      }
      await this.backfillMissingDates(missingData)
      console.log('Historical data is now complete ✅')
      return
    } catch (error) {
      console.log('❌ Failed to check historical data completeness', error)
      throw error
    }
  }

  getAllAssetsFromConfig(): string[] {
    const result = []
    for (const asset of this.assetConfig) {
      result.push(asset.assetName)
    }
    return result
  }

  async getMissingDataFromDB(assetNames: string[]): Promise<MissingDataMap> {
    const result: MissingDataMap = {}
    try {
      for (const asset of assetNames) {
        const missingDates = await this.getMissingDatesForAsset(asset)
        result[asset] = missingDates
      }
      return result
    } catch (error) {
      console.log('❌ Failed to check data from db')
      throw error
    }
  }

  private async getMissingDatesForAsset(assetName: string): Promise<number[]> {
    const startDate = new Date()
    const endDate = new Date()
    startDate.setDate(startDate.getDate() - this.DAYS_TO_CHECK)
    endDate.setDate(endDate.getDate() - 1)
    try {
      // Find the pool config to get the asset enum value
      const poolConfig = this.assetConfig.find((p) => p.assetName === assetName)
      if (!poolConfig) {
        throw new Error(`No pool config found for asset name: ${assetName}`)
      }

      const priceData = await this.db.query.historicalPrices.findMany({
        where: and(
          eq(historicalPrices.asset, poolConfig.asset as any),
          gte(historicalPrices.date, startDate.toISOString().split('T')[0]),
          lte(historicalPrices.date, endDate.toISOString().split('T')[0])
        ),
      })

      const existingDates = new Set(
        priceData.map((record: HistoricalPrice) => {
          const date = new Date(record.date)
          return date.setUTCHours(0, 0, 0, 0)
        })
      )
      const expectedDates = this.generateDateRange(startDate, endDate)
      const missingDates = expectedDates.filter((date) => !existingDates.has(date))
      return missingDates
    } catch (error) {
      console.log('❌ Unable to find missing dates')
      throw error
    }
  }

  private async backfillMissingDates(missingDateData: MissingDataMap): Promise<void> {
    try {
      for (const [asset, data] of Object.entries(missingDateData)) {
        await this.backfillDataForAsset(asset, data)
      }
    } catch (error) {
      console.log('❌ Unable to backfill data')
      throw error
    }
  }

  private async backfillDataForAsset(assetName: string, dates: number[]): Promise<void> {
    try {
      console.log('Fetching price data for:', assetName)
      const poolConfig = this.assetConfig.find((p) => p.assetName === assetName)
      if (!poolConfig) {
        throw Error('Invalid config please check')
      }
      const [minDate, maxDate] = this.calculateMinMaxDate(dates)
      const priceData: any = await this.fetchDataFromCoinGecko(
        minDate / 1000,
        maxDate / 1000,
        poolConfig.assetName
      )
      const timestamps: Date[] = []
      const prices: string[] = []

      // Build parallel arrays
      for (const [timestamp, price] of priceData.prices) {
        timestamps.push(new Date(timestamp))
        prices.push(String(price))
      }

      // Insert records one by one (Drizzle doesn't support bulk upsert with raw SQL easily)
      let insertedCount = 0
      for (let i = 0; i < timestamps.length; i++) {
        const dateStr = new Date(timestamps[i]).toISOString().split('T')[0]

        // Check if record exists
        const existing = await this.db.query.historicalPrices.findFirst({
          where: and(
            eq(historicalPrices.asset, poolConfig.asset as any),
            eq(historicalPrices.date, dateStr)
          ),
        })

        if (!existing) {
          await this.db.insert(historicalPrices).values({
            asset: poolConfig.asset as any,
            date: dateStr,
            price: prices[i],
            source: 'API',
          })
          insertedCount++
        }
      }

      console.log(
        `💾 Inserted ${insertedCount} new historical records for ${poolConfig.asset}`
      )
      return
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  private async fetchDataFromCoinGecko(
    startTimestamp: number,
    endTimestamp: number,
    asset: string
  ) {
    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        from: startTimestamp.toString(),
        to: endTimestamp.toString(),
      })
      console.log(asset, 'Checking asset name')
      const url = `https://api.coingecko.com/api/v3/coins/${asset}/market_chart/range?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': `${process.env.COINGECKO_API_KEY}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.log('❌ Unable to fetch data from coin gecko')
      throw error
    }
  }

  private calculateMinMaxDate(dates: number[]): [number, number] {
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return [minDate, maxDate]
  }

  private generateDateRange(startDate: Date, endDate: Date): number[] {
    const startTimestamp = startDate.setUTCHours(0, 0, 0, 0)
    const endTimestamp = endDate.setUTCHours(0, 0, 0, 0)
    const result: number[] = []
    for (let i = startTimestamp; i <= endTimestamp; i = i + 24 * 60 * 60 * 1000) {
      result.push(i)
    }
    return result
  }
}
