"use client";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useState, useRef, useEffect, useCallback, JSX } from "react";
import { WalletOptions } from "@/providers/wallet-options";
import { formatWalletAddress, getWalletIconByName } from "@/lib/utils";
import Image from "next/image";
import { ExpandingDisconnectButton } from "./ExpandingDisconnect";
import { useBalance } from "wagmi";
import { useApi } from "@/hooks/useApi";
import { createPortal } from "react-dom";
import { Card } from "./Card";
import type { Address } from "viem";

interface AuthChallengeResponse {
  message: string;
  success?: boolean;
}

interface AuthState {
  showModal: boolean;
  data: AuthChallengeResponse | null;
  isLoading: boolean;
}

interface ConnectedWalletProps {
  address: Address;
  connector:
    | {
        name?: string;
        icon?: string;
      }
    | undefined;
  disconnect: () => void;
}

interface WalletConnectDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletProps {
  className?: string;
}

interface UseWalletAuthReturn {
  showAuthModal: boolean;
  authData: AuthChallengeResponse | null;
  isAuthLoading: boolean;
  closeAuthModal: () => void;
}

interface UsdtAddress {
  [chainId: number]: Address;
}

// USDT contract addresses for different chains
const USDT_ADDRESSES: UsdtAddress = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
  137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
  56: "0x55d398326f99059fF775485246999027B3197955", // BSC
  42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum
  10: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // Optimism
  999: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // hyperliquid
} as const;

// Custom hook for wallet authentication
function useWalletAuth(
  isConnected: boolean,
  address: Address | undefined
): UseWalletAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    showModal: false,
    data: null,
    isLoading: false,
  });

  const { execute } = useApi<AuthChallengeResponse>();
  const requestedRef = useRef<boolean>(false);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");

    if (
      isConnected &&
      address &&
      !jwt &&
      !requestedRef.current &&
      !authState.isLoading
    ) {
      requestedRef.current = true;
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      execute({
        url: "/auth/challenge",
        method: "post",
        data: { walletAddress: address },
      })
        .then((data: AuthChallengeResponse | undefined) => {
          if (data) {
            setAuthState({
              showModal: true,
              data,
              isLoading: false,
            });
          } else {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        })
        .catch((error: Error) => {
          console.error("Auth challenge failed:", error);
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        });
    }

    // Reset when disconnected
    if (!isConnected) {
      requestedRef.current = false;
      setAuthState({ showModal: false, data: null, isLoading: false });
    }
  }, [isConnected, address, execute, authState.isLoading]);

  const closeModal = useCallback((): void => {
    setAuthState((prev) => ({ ...prev, showModal: false }));
  }, []);

  return {
    showAuthModal: authState.showModal,
    authData: authState.data,
    isAuthLoading: authState.isLoading,
    closeAuthModal: closeModal,
  };
}

// Separate component for connected wallet display
function ConnectedWallet({
  address,
  connector,
  disconnect,
}: ConnectedWalletProps): JSX.Element {
  const { data: usdtBalance, isLoading: isUsdtLoading } = useBalance({
    address: address,
    token: USDT_ADDRESSES[999],
    chainId: 999,
  });

  const formatUsdtBalance = useCallback(
    (balance: typeof usdtBalance): string => {
      if (!balance) return "0.00";
      const value = parseFloat(balance.formatted);
      if (value < 0.01) return "< 0.01";
      return value.toFixed(2);
    },
    []
  );

  return (
    <div className="text-white flex gap-2 items-center">
      {isUsdtLoading ? (
        <div className="text-white text-sm">Loading balance...</div>
      ) : (
        usdtBalance && (
          <div className="flex items-center text-sm gap-2 text-gray-400">
            <Image
              src="/usdt0.svg"
              height={20}
              width={20}
              alt="USDT"
              priority={false}
            />
            <div className="flex flex-col gap-0">
              <div className="text-white">USDT0</div>
              <div>{formatUsdtBalance(usdtBalance)}</div>
            </div>
          </div>
        )
      )}
      <div className="bg-gray-800/70 rounded-2xl p-2 flex gap-2 items-center">
        <Image
          src={connector?.icon || getWalletIconByName(connector?.name || "")}
          width={15}
          height={15}
          alt="Wallet icon"
          priority={false}
        />
        <div className="text-sm">{formatWalletAddress(address)}</div>
      </div>
      <ExpandingDisconnectButton disconnect={disconnect} />
    </div>
  );
}

// Separate component for wallet connection dropdown
function WalletConnectDropdown({
  isOpen,
  onClose,
}: WalletConnectDropdownProps): JSX.Element | null {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 bg-gray-800/50 backdrop-blur-sm w-72 mt-2 rounded-lg z-20 border border-gray-600/50 shadow-xl"
    >
      <div className="p-4">
        <div className="text-white text-sm font-medium mb-3">
          Connect wallet
        </div>
        <WalletOptions className="text-gray-300 w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors cursor-pointer" />
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
        <div className="text-gray-300 text-xs leading-relaxed">
          By connecting you accept our terms and privacy policy
        </div>
      </div>
    </div>
  );
}

// Loading indicator component
function AuthLoadingIndicator(): JSX.Element {
  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50">
      Preparing authentication...
    </div>
  );
}

// Auth modal component
interface AuthModalProps {
  showModal: boolean;
  authData: AuthChallengeResponse | null;
  onClose: () => void;
}

function AuthModal({
  showModal,
  authData,
  onClose,
}: AuthModalProps): JSX.Element | null {
  if (!showModal || !authData?.message) return null;

  return createPortal(
    <Card setShowModal={onClose} message={authData.message} />,
    document.body
  );
}

// Main wallet component
export default function Wallet({ className }: WalletProps): JSX.Element {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  // Use custom auth hook
  const { showAuthModal, authData, isAuthLoading, closeAuthModal } =
    useWalletAuth(isConnected, address);

  const toggleDropdown = useCallback((): void => {
    setOpenDropdown((prev) => !prev);
  }, []);

  const closeDropdown = useCallback((): void => {
    setOpenDropdown(false);
  }, []);

  if (isConnected && address) {
    return (
      <>
        <ConnectedWallet
          address={address}
          connector={connector}
          disconnect={disconnect}
        />

        {/* Auth Modal */}
        <AuthModal
          showModal={showAuthModal}
          authData={authData}
          onClose={closeAuthModal}
        />

        {/* Loading indicator for auth */}
        {isAuthLoading && <AuthLoadingIndicator />}
      </>
    );
  }

  return (
    <div className="relative inline-block">
      <Button className={className} onClick={toggleDropdown}>
        Connect
      </Button>
      <WalletConnectDropdown isOpen={openDropdown} onClose={closeDropdown} />
    </div>
  );
}
