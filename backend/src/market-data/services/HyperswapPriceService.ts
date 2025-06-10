import { ethers } from "ethers";
import { ASSET_TYPE, PrismaClient } from "@prisma/client";
import type { PoolConfig } from "../types/market-data.types.ts";
import HyperswapPool from "../abis/HyperswapV3Pool.json" with { type: "json" };

const poolAbi = HyperswapPool.abi as ethers.InterfaceAbi;

export class HyperswapPriceService {
    private provider: ethers.JsonRpcProvider;

    constructor( private prisma: PrismaClient , rpcUrl: string, private poolConfigs: PoolConfig[]) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl)
    }

    async getCurrentPoolPrices( asset: string ): Promise<number> {
        const poolConfig = this.poolConfigs.find( p => p.asset === asset )
        if(!poolConfig) {
            throw new Error(`No pool configuration found: ${asset}`)
        }
        try {
            const poolContract = new ethers.Contract(poolConfig.address, HyperswapPool.abi, this.provider)
            const [sqrtPriceX96] = await poolContract.slot0(); 
            const price = this.sqrtPriceX96ToDecimal(
                sqrtPriceX96,
                poolConfig.token0Decimals,
                poolConfig.token1Decimals
            );
            console.log(`💰 ${asset} price from pool: ${price.toFixed(6)}`);
            return price;
          } catch (error) {
            console.error(`Failed to fetch price for ${asset} from pool:`, error);
            throw error;
          }
    }

    async getAllCurrentPoolPrices (): Promise<Record<string, number>> {
        const prices: Record<string, number> = {}

        for (const poolConfig of this.poolConfigs) {
            try {
                prices[poolConfig.asset] = await this.getCurrentPoolPrices(poolConfig.asset);
            } catch (error) {
                console.log("Failed to fetch price of asset,", poolConfig.asset);
            }
        }

        return prices

    }

    async saveCurrentPrices(): Promise<void> {
        console.log("Fetching and saving prices from hyperswap");
        try {
            const prices = await this.getAllCurrentPoolPrices();
            const timestamp = new Date();

            for(const [asset, price] of Object.entries(prices)) {
                await this.prisma.priceCache.create({
                    data: {
                        asset,
                        timestamp,
                        price: price.toString(),
                        source: 'DEX'
                    }
                })
                await this.saveAsHistoricalPrice(asset, price, timestamp)
            }
        } catch (error) {
            
        }
    }

    async healthCheck(): Promise<{ status: string; poolsChecked: number; errors: string[] }> {
        const errors: string[] = [];
        let poolsChecked = 0;
        
        for (const poolConfig of this.poolConfigs) {
          try {
            await this.getCurrentPoolPrices(poolConfig.asset);
            poolsChecked++;
          } catch (error: any) {
            errors.push(`${poolConfig.asset}: ${error.message}`);
          }
        }
        
        return {
          status: errors.length === 0 ? 'healthy' : 'partial',
          poolsChecked,
          errors
        };
      }
    
      async validatePoolConfig(poolConfig: PoolConfig): Promise<boolean> {
        try {
          const poolContract = new ethers.Contract(
            poolConfig.address,
            HyperswapPool.abi,
            this.provider
          );
    
          const [token0, token1, fee] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee()
          ]);
    
          console.log(`Pool ${poolConfig.asset}:`, {
            address: poolConfig.address,
            token0: token0.toLowerCase(),
            token1: token1.toLowerCase(),
            fee: fee.toString(),
            expectedToken0: poolConfig.token0.toLowerCase(),
            expectedToken1: poolConfig.token1.toLowerCase()
          });
    
          const token0Match = token0.toLowerCase() === poolConfig.token0.toLowerCase();
          const token1Match = token1.toLowerCase() === poolConfig.token1.toLowerCase();
    
          if (!token0Match || !token1Match) {
            console.error(`❌ Pool configuration mismatch for ${poolConfig.asset}`);
            return false;
          }
    
          console.log(`✅ Pool configuration valid for ${poolConfig.asset}`);
          return true;
          
        } catch (error) {
          console.error(`❌ Failed to validate pool config for ${poolConfig.asset}:`, error);
          return false;
        }
      }
    
    

    private async saveAsHistoricalPrice(asset: string, price: number, timestamp: Date): Promise<void> {
        const dateOnly = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
        
        await this.prisma.historicalPrice.upsert({
          where: {
            asset_date: {
              asset,
              date: dateOnly
            }
          },
          update: {
            price: price.toString(),
            source: 'DEX',
            updatedAt: new Date()
          },
          create: {
            asset,
            date: dateOnly,
            price: price.toString(),
            source: 'DEX'
          }
        });
      }

    private sqrtPriceX96ToDecimal( sqrtPriceX96: ethers.BigNumberish, token0Decimals: number, token1Decimals: number) {
        try {
      // Constants
      const Q96 = 2n ** 96n;
      const PRECISION = 10n ** 18n;
      
      // Convert sqrtPriceX96 to price
      // price = (sqrtPriceX96 / 2^96)^2
      const sqrtPrice = (BigInt(sqrtPriceX96) * PRECISION) / Q96;
      const price = (sqrtPrice * sqrtPrice) / PRECISION;
      
      // Adjust for decimal differences
      // If token0 has more decimals, price needs to be adjusted down
      const decimalDifference = token0Decimals - token1Decimals;
      let adjustedPrice: bigint;
      
      if (decimalDifference > 0) {
        adjustedPrice = price * (10n ** BigInt(decimalDifference));
      } else if (decimalDifference < 0) {
        adjustedPrice = price / (10n ** BigInt(-decimalDifference));
      } else {
        adjustedPrice = price;
      }
      
      // Convert to number with proper decimals
      const divisor = 10n ** BigInt(token0Decimals);
      const wholePart = adjustedPrice / divisor;
      const fractionalPart = adjustedPrice % divisor;
      
      // Combine whole and fractional parts
      const result = Number(wholePart) + Number(fractionalPart) / Number(divisor);
      
      return result;
      
    } catch (error) {
      console.error('Error converting sqrtPriceX96 to price:', error);
      throw new Error('Failed to convert pool price');
    }
    }
}