export interface PoolConfig {
    address: string;
    token0: string;
    token1: string;
    token0Decimals: number;
    token1Decimals: number;
    asset: string;
}

export interface PriceData {
    asset: string;
    price: number;
    timestamp: Date;
    source: 'DEX' | 'API';
  }