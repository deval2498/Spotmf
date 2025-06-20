"use client";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { WalletOptions } from "@/providers/wallet-options";
import { formatWalletAddress } from "@/lib/utils";
import { RiShutDownLine } from "react-icons/ri";
import Image from "next/image";
import { getWalletIconByName } from "@/lib/utils";
import { ExpandingDisconnectButton } from "./ExpandingDisconnect";
import { useBalance } from "wagmi";

// USDT contract addresses for different chains
const USDT_ADDRESSES = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
  137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
  56: "0x55d398326f99059fF775485246999027B3197955", // BSC
  42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum
  10: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // Optimism
  999: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // hyperliquid
  // Add more chains as needed
};

interface WalletProps {
  className?: string;
}

export default function Wallet({ className }: WalletProps) {
  const { address, isConnected, connector } = useAccount();
  const [openDropdown, setOpenDropdown] = useState(false);
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { connectors, connect } = useConnect();
  const {
    data: usdtBalance,
    isLoading: isUsdtLoading,
    error,
  } = useBalance({
    address: address,
    token: USDT_ADDRESSES[999] as `0x${string}`,
    chainId: 999,
  });
  const formatUsdtBalance = (balance) => {
    if (!balance) return "0.00";
    const value = parseFloat(balance.formatted);
    if (value < 0.01) return "< 0.01";
    return value.toFixed(2);
  };

  if (isConnected) {
    console.log(usdtBalance, chainId, isUsdtLoading, error, "checking");
    return (
      <div className="text-white flex gap-2 items-center">
        {isUsdtLoading ? (
          <div className="text-white">Loading...</div>
        ) : (
          usdtBalance && (
            <div className="flex items-center text-sm gap-2 text-gray-400">
              <Image src="/usdt0.svg" height={20} width={20} alt="" />
              <div className="flex flex-col gap-0">
                <div className="text-white">USDT0</div>
                <div>{formatUsdtBalance(usdtBalance)}</div>
              </div>
            </div>
          )
        )}
        <div className="bg-gray-800/70 rounded-2xl p-2 flex gap-2 items-center">
          <Image
            src={connector?.icon || getWalletIconByName(connector?.name)}
            width={15}
            height={15}
            alt=""
          />
          <div className="text-sm">{formatWalletAddress(address)}</div>
        </div>
        <ExpandingDisconnectButton disconnect={disconnect} />
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Button
        className={className}
        onClick={() => setOpenDropdown((prev) => !prev)}
      >
        Connect
      </Button>
      {openDropdown && (
        <div className="absolute right-0 bg-gray-800/50 backdrop-blur-sm w-72 mt-2 rounded-lg z-20 border border-gray-600/50 shadow-xl">
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
      )}
    </div>
  );
}
