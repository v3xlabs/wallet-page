"use client";

import { useState } from "react";

import { getChainId } from "../../../lib/ethereum";
import { MiniDemo } from "../../wallet/MiniDemo";
import { useWallet } from "../../wallet/WalletProvider";

export function EthChainIdDemo() {
  const { session } = useWallet();
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();

  return (
    <MiniDemo
      title="eth_chainId"
      description="Read-only — returns the wallet’s active chain as hex."
      actionLabel="Call eth_chainId"
      idleHint={
        session
          ? "Returns the chain the wallet reports right now."
          : "Connect on /connect first."
      }
      result={result}
      error={error}
      onAction={async () => {
        if (!session) {
          setError("Connect a wallet on /connect first.");
          return;
        }
        setError(undefined);
        try {
          const chainId = await getChainId(session.provider);
          setResult(chainId);
        }
        catch (err) {
          setResult(undefined);
          setError(err instanceof Error ? err.message : String(err));
        }
      }}
    />
  );
}
