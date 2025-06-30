import { http, createConfig } from 'wagmi'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { hyperliquid } from '../providers/chains'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!
console.log(projectId, "checking project id")
export const config = createConfig({
  chains: [hyperliquid],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [hyperliquid.id]: http(process.env.NEXT_PUBLIC_HYPERLIQUID_RPC!)
  },
})
