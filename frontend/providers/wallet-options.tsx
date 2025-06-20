"use client";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useConnect } from "wagmi";

export function WalletOptions({ className }) {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <button
      className={cn(className)}
      key={connector.uid}
      onClick={() => connect({ connector })}
    >
      {connector.name}
    </button>
  ));
}
