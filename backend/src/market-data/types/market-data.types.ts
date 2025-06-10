export interface PoolConfig {
    address: string;
    token0: string;
    token1: string;
    token0Decimals: number;
    token1Decimals: number;
    asset: string;
    pricePerToken: 'T0' | 'T1'
}

export interface PriceData {
    asset: string;
    price: number;
    timestamp: Date;
    source: 'DEX' | 'API';
  }