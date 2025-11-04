"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Token {
  symbol: string;
  name: string;
  logo: string;
}

interface TokenSelectorProps {
  selectedToken: string;
  onSelect: (symbol: string) => void;
}

const TOKENS: Token[] = [
  { symbol: "UBTC", name: "Bitcoin", logo: "/bitcoin.svg" },
  { symbol: "WETH", name: "Ethereum", logo: "/ethereum.svg" },
  { symbol: "WHYPE", name: "Hyperliquid", logo: "/hyperliquid.svg" },
];

export function TokenSelector({ selectedToken, onSelect }: TokenSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Token to Invest
      </label>
      <div className="flex gap-4 justify-start">
        {TOKENS.map((token) => (
          <button
            key={token.symbol}
            type="button"
            onClick={() => onSelect(token.symbol)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-105",
              selectedToken === token.symbol
                ? "bg-green-50 dark:bg-green-950/20"
                : "bg-transparent"
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all p-2",
                selectedToken === token.symbol
                  ? "ring-4 ring-green-500 ring-offset-2 ring-offset-background bg-white"
                  : "opacity-70 hover:opacity-100 bg-white/90"
              )}
            >
              <Image
                src={token.logo}
                alt={`${token.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {token.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
