import { PoolConfig } from '../types/market-data.types.ts';

export const HYPEREVM_POOL_CONFIGS: PoolConfig[] = [
  {
    address: '0x2850Fe0dcf4CA5e0a7B8355f4a875F96a92de948', // USDT/UETH pool address - NEED THIS
    token0: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT
    token1: '0xBe6727B535545C67d5cAa73dEa54865B92CF7907', // UETH  
    token0Decimals: 6, // USDT decimals
    token1Decimals: 18, // UETH decimals (adjust if different)
    asset: 'UETH',
    pricePerToken: 'T1',
    assetName: 'ethereum'
  },
  {
    address: '0x7caC5c8ad2FB1216d3F262b2c9Cd5548D0329E78', // USDT/UBTC pool address - NEED THIS
    token1: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT
    token0: '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', // UBTC
    token0Decimals: 8, // UBTC decimals
    token1Decimals: 6, // USDT decimals (adjust if different)
    asset: 'UBTC',
    pricePerToken: 'T0',
    assetName: 'bitcoin'
  },
  {
    address: '0x7f63aC9b82905d870071024FA310cF0Ab8A74ad1', // USDT/WHYPE pool address - NEED THIS
    token0: '0x5555555555555555555555555555555555555555', // WHYPE
    token1: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT
    token0Decimals: 18, // WHYPE decimals
    token1Decimals: 6, // USDT decimals (adjust if different)
    asset: 'WHYPE',
    pricePerToken: 'T0',
    assetName: 'hyperliquid'
  }
]