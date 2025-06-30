// config/chains.js
import { defineChain } from 'viem';

export const hyperliquid = defineChain({
  id: 999,
  name: 'Hyperliquid',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_HYPERLIQUID_RPC!],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperscan',
      url: 'https://www.hyperscan.com',
    },
  },
  testnet: false,
});