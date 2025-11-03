"use client";

/**
 * ConnectWalletButton Component
 *
 * A production-ready wallet connection button that handles:
 * - Connecting to MetaMask/WalletConnect
 * - Displaying connected address (truncated)
 * - Network switching for wrong chain
 * - Disconnecting
 *
 * Uses wagmi v2 hooks for wallet state management.
 *
 * @example
 * ```tsx
 * import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton"
 *
 * export function Navbar() {
 *   return (
 *     <nav>
 *       <ConnectWalletButton />
 *     </nav>
 *   )
 * }
 * ```
 */

import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Wallet, Power, Link as ChainIcon } from "lucide-react";

/**
 * Truncate Ethereum address for display
 * @example "0x1234...abcd"
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface ConnectWalletButtonProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

export function ConnectWalletButton({ className }: ConnectWalletButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [showConnectors, setShowConnectors] = useState(false);
  const [isDisconnectConfirming, setIsDisconnectConfirming] = useState(false);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle disconnect confirmation auto-collapse
  useEffect(() => {
    if (isDisconnectConfirming) {
      disconnectTimerRef.current = setTimeout(() => {
        setIsDisconnectConfirming(false);
      }, 2000);
    }

    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
    };
  }, [isDisconnectConfirming]);

  // Handle disconnect click
  const handleDisconnectClick = () => {
    if (isDisconnectConfirming) {
      // Second click - actually disconnect
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
      disconnect();
      setIsDisconnectConfirming(false);
    } else {
      // First click - show confirmation
      setIsDisconnectConfirming(true);
    }
  };

  // ============================================================================
  // Render: Not Connected
  // ============================================================================

  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowConnectors(!showConnectors)}
          disabled={isConnecting}
          className={cn("h-10 text-sm font-medium", className)}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>

        {/* Connector Selection Dropdown */}
        {showConnectors && (
          <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50">
            <div className="p-2 space-y-1">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                Choose Wallet
              </p>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowConnectors(false);
                  }}
                  disabled={isConnecting}
                  className={cn(
                    "w-full px-3 py-2 rounded-md text-left text-sm font-medium",
                    "hover:bg-muted transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {connector.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // Render: Connected but Wrong Network
  // ============================================================================

  // Check if user is on an unsupported network
  // In production, define your supported chain IDs
  const SUPPORTED_CHAIN_IDS = [1, 11155111, 998]; // Mainnet, Sepolia, HyperEVM
  const isWrongNetwork = chain && !SUPPORTED_CHAIN_IDS.includes(chain.id);

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          onClick={() => {
            // Switch to the first supported chain (could make this configurable)
            switchChain({ chainId: SUPPORTED_CHAIN_IDS[0] });
          }}
          className={cn("h-10 text-sm font-medium", className)}
        >
          Wrong Network
        </Button>
        <Button
          variant="ghost"
          onClick={handleDisconnectClick}
          className={cn(
            "h-10 border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-500",
            "transition-all duration-300 ease-in-out overflow-hidden",
            isDisconnectConfirming ? "w-32" : "w-10"
          )}
          title={isDisconnectConfirming ? "Click again to confirm" : "Disconnect Wallet"}
        >
          <div className={cn(
            "flex items-center whitespace-nowrap",
            !isDisconnectConfirming && "justify-center",
            isDisconnectConfirming && "gap-2"
          )}>
            <Power className="w-5 h-5 flex-shrink-0 transition-all duration-300" />
            <span className={cn(
              "text-sm font-medium transition-all duration-300",
              isDisconnectConfirming ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
            )}>
              Disconnect
            </span>
          </div>
        </Button>
      </div>
    );
  }

  // ============================================================================
  // Render: Connected and Correct Network
  // ============================================================================

  return (
    <div className="flex items-center gap-2">
      {/* Chain Badge */}
      {chain && (
        <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg bg-muted text-xs font-medium">
          <ChainIcon className="w-4 h-4 text-muted-foreground" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      )}

      {/* Address Display */}
      <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-lg bg-muted text-sm font-medium">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <span>{address ? truncateAddress(address) : "Connected"}</span>
      </div>

      {/* Disconnect Button - Power Icon with Slide Animation */}
      <Button
        variant="ghost"
        onClick={handleDisconnectClick}
        className={cn(
          "h-10 border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-500",
          "transition-all duration-300 ease-in-out overflow-hidden",
          isDisconnectConfirming ? "w-32" : "w-10",
          className
        )}
        title={isDisconnectConfirming ? "Click again to confirm" : "Disconnect Wallet"}
      >
        <div className={cn(
          "flex items-center whitespace-nowrap",
          !isDisconnectConfirming && "justify-center",
          isDisconnectConfirming && "gap-2"
        )}>
          <Power className="w-5 h-5 flex-shrink-0 transition-all duration-300" />
          <span className={cn(
            "text-sm font-medium transition-all duration-300",
            isDisconnectConfirming ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
          )}>
            Disconnect
          </span>
        </div>
      </Button>
    </div>
  );
}
