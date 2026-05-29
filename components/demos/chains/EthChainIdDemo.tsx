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
      actionLabel="Call eth_chainId"
      idleHint={
        session
          ? undefined
          : "Connect on /connect first."
      }
      inspector={{
        user: <p>Read the wallet&apos;s active chain (hex).</p>,
        rpc: { method: "eth_chainId", params: [] },
      }}
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
