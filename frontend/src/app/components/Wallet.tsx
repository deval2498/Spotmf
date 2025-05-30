"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/Button";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div>
        <div>Connected: {address}</div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );

  return (
    <div>
      <Button onClick={() => connect({ connector: injected() })}>
        Connect Wallet
      </Button>
    </div>
  );
}
