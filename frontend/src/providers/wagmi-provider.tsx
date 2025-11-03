"use client";

/**
 * WagmiConfigProvider
 *
 * Global provider for wagmi v2 + viem wallet connectivity.
 * Wraps the app with:
 * - QueryClientProvider (required by wagmi for caching)
 * - WagmiProvider (wallet state management)
 *
 * This provider configures:
 * - Supported chains (Mainnet, Sepolia, HyperEVM)
 * - Wallet connectors (MetaMask via injected, WalletConnect)
 * - Public RPC endpoints (use your own for production)
 *
 * @see https://wagmi.sh/react/getting-started
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import type { ReactNode } from "react";

// ============================================================================
// Custom Chain Configuration: HyperEVM
// ============================================================================

/**
 * HyperEVM Chain Configuration
 *
 * Hyperliquid's EVM-compatible chain. Update these values with the correct:
 * - Chain ID
 * - RPC URL
 * - Block explorer URL
 *
 * @see https://docs.hyperliquid.xyz (when available)
 */
const hyperEVM = {
  id: 998, // PLACEHOLDER - Replace with actual HyperEVM chain ID
  name: "HyperEVM",
  nativeCurrency: {
    name: "HYPE",
    symbol: "HYPE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz"], // PLACEHOLDER - Use actual RPC
    },
  },
  blockExplorers: {
    default: {
      name: "HyperScan",
      url: "https://hyperscan.xyz", // PLACEHOLDER - Use actual explorer
    },
  },
  testnet: false,
} as const;

// ============================================================================
// Wagmi Configuration
// ============================================================================

/**
 * WalletConnect Project ID
 *
 * Required for WalletConnect v2.
 * Get your project ID at: https://cloud.walletconnect.com
 *
 * IMPORTANT: Replace this placeholder with your own project ID
 */
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE";

/**
 * Create wagmi configuration
 *
 * Configures:
 * - Supported chains (can add more by importing from wagmi/chains)
 * - Connectors (MetaMask via injected, WalletConnect)
 * - Transport layer (HTTP RPC endpoints)
 */
export const config = createConfig({
  chains: [mainnet, sepolia, hyperEVM],
  connectors: [
    // MetaMask and other browser wallets
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect v2
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: "SpotMF",
        description: "Automate your crypto investments with SIP and DMA strategies",
        url: typeof window !== "undefined" ? window.location.origin : "https://spotmf.com",
        icons: [typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "https://spotmf.com/logo.png"],
      },
      showQrModal: true,
    }),
  ],
  // Configure transports (RPC providers) for each chain
  transports: {
    [mainnet.id]: http(), // Uses public RPC - replace with Infura/Alchemy for production
    [sepolia.id]: http(), // Uses public RPC - replace with Infura/Alchemy for production
    [hyperEVM.id]: http(), // Uses custom RPC from chain config
  },
  // Enable SSR support for Next.js
  ssr: true,
});

// ============================================================================
// React Query Client
// ============================================================================

/**
 * React Query Client for wagmi
 *
 * wagmi v2 uses @tanstack/react-query for state management and caching.
 * This client is required and must wrap the WagmiProvider.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetching on window focus
      refetchOnWindowFocus: false,
      // Keep unused data in cache for 5 minutes
      gcTime: 1_000 * 60 * 5,
    },
  },
});

// ============================================================================
// Provider Component
// ============================================================================

interface WagmiConfigProviderProps {
  children: ReactNode;
}

/**
 * WagmiConfigProvider Component
 *
 * Wrap your app with this provider to enable wallet connectivity.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WagmiConfigProvider>
 *           {children}
 *         </WagmiConfigProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function WagmiConfigProvider({ children }: WagmiConfigProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
