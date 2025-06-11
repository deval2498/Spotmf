import { HistoricalPrice, PrismaClient } from "@prisma/client";
import { PoolConfig } from "../types/market-data.types.ts";

type MissingDataMap = Record<string, number[]>

export class HistoricalDataManager {
    private readonly DAYS_TO_CHECK = 365
    constructor( private prisma: PrismaClient, private assetConfig: PoolConfig[]) {}

    async ensureHistoricalData():Promise<void> {
        console.log('Checking historical data completeness......');
        try {
            const assets = this.getAllAssetsFromConfig()
            const missingData = await this.getMissingDataFromDB(assets);
            if(Object.keys(missingData).length == 0) {
                console.log('Data is complete.');
                return
            }
            await this.backfillMissingDates(missingData);
            console.log('Historical data is now complete ✅');
            return
        } catch (error) {
            console.log('❌ Failed to check historical data completeness',error);
            throw error
        }
    }

    getAllAssetsFromConfig(): string[] {
        const result = []
        for(const asset of this.assetConfig) {
            result.push(asset.assetName)
        }
        return result       
    }

    async getMissingDataFromDB(assetNames: string[]): Promise<MissingDataMap> {
        const result: MissingDataMap = {}
        try {
            for(const asset of assetNames) {
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
            const priceData = await this.prisma.historicalPrice.findMany({
                where: {
                    assetName,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })
            const existingDates = new Set(
                priceData.map((record: HistoricalPrice) => record.date.setUTCHours(0, 0, 0, 0))
            )
            const expectedDates = this.generateDateRange(startDate, endDate)
            const missingDates = expectedDates.filter(date => !existingDates.has(date))
            return missingDates
        } catch (error) {
            console.log("❌ Unable to find missing dates")
            throw error
        }
    }

    private async backfillMissingDates(missingDateData: MissingDataMap): Promise<void> {
        try {
            for( const[asset, data] of Object.entries(missingDateData) ) {
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
            const poolConfig = this.assetConfig.find( p => p.assetName == assetName)
            if(!poolConfig) {
                throw Error("Invalid config please check")
            }
            const [minDate, maxDate] = this.calculateMinMaxDate(dates)
            const priceData: any = await this.fetchDataFromCoinGecko(minDate / 1000, maxDate / 1000, poolConfig.assetName)
            const timestamps: Date[] = [];
            const prices: string[] = [];
            
            // Build parallel arrays
            for (const [timestamp, price] of priceData.prices) {
                timestamps.push(new Date(timestamp));
                prices.push(String(price));
            }
        
            const result = await this.prisma.$executeRaw`
            INSERT INTO historical_prices (id, asset, asset_name, date, price, source, updated_at)
            SELECT gen_random_uuid(), ${poolConfig.asset}, ${assetName}, d.date, d.price, 'API', NOW()
            FROM unnest(${timestamps}::timestamp[], ${prices}::text[]) AS d(date, price)
            WHERE NOT EXISTS (
                SELECT 1 FROM historical_prices 
                WHERE asset = ${poolConfig.asset} AND date = d.date
            )
        `;
        
        console.log(`💾 Inserted ${result} new historical records for ${poolConfig.asset}`);
        return
        } catch (error) {
            console.log(error)
            throw error
        }
        
    }

    private async fetchDataFromCoinGecko(startTimestamp: number, endTimestamp: number, asset: string) {
        try {
            const params = new URLSearchParams({
                vs_currency: 'usd',
                from: startTimestamp.toString(),
                to: endTimestamp.toString()
            });
            console.log(asset, "Checking asset name")
            const url = `https://api.coingecko.com/api/v3/coins/${asset}/market_chart/range?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'x-cg-demo-api-key': `${process.env.COINGECKO_API_KEY}`
                }
            });
          
            const data = await response.json();
            return data;   
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
        const result:number[] = []
        for(let i = startTimestamp; i <= endTimestamp; i = i + (24*60*60*1000)) {
            result.push(i)
        }
        return result
    }
}