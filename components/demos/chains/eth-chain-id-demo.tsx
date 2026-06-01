"use client";

import { useState } from "react";

import { formatError, getChainId } from "../../../lib/ethereum";
import { MiniDemo } from "../../wallet/MiniDemo";
import { useWallet } from "../../wallet/WalletProvider";

export function EthChainIdDemo() {
  const { session } = useWallet();
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();

  return (
    <MiniDemo
      source="components/demos/chains/eth-chain-id-demo.tsx"
      title="eth_chainId"
      inspector={{
        user: <p>Read the wallet&apos;s active chain (hex).</p>,
        request: { method: "eth_chainId", params: [] },
      }}
      response={response}
      error={error}
      actionLabel="Call eth_chainId"
      onAction={async () => {
        if (!session) return;

        setError(undefined);

        try {
          const chainId = await getChainId(session.provider);

          setResponse(String(chainId));
        }
        catch (error_) {
          setResponse(undefined);
          setError(formatError(error_));
        }
      }}
    />
  );
}
