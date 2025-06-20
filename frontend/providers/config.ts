import { http, createConfig } from 'wagmi'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { hyperliquid } from './chains'

const projectId = process.env.WALLETCONNECT_PROJECT_ID!

export const config = createConfig({
  chains: [hyperliquid],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [hyperliquid.id]: http('https://rpc.hyperliquid.xyz/evm')
  },
})
