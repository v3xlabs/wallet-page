"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { getDemoChain } from "../../../lib/chains";
import { formatError, getChainId, rpc } from "../../../lib/ethereum";
import { MiniDemo } from "../../wallet/MiniDemo";
import { useWallet } from "../../wallet/WalletProvider";
import { ChainSelect } from "./ChainSelect";

export function SwitchChainMiniDemo() {
  const { session, refreshSession } = useWallet();
  const [chainId, setChainId] = useState<Hex>("0xaa36a7");
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();

  const chain = getDemoChain(chainId);

  return (
    <MiniDemo
      title="wallet_switchEthereumChain"
      description={<ChainSelect value={chainId} onChange={setChainId} />}
      actionLabel="Switch chain"
      idleHint={session ? undefined : "Connect on /connect first."}
      inspector={{
        user: (
          <p>
            Switch to <strong>{chain?.name ?? "network"}</strong> (
            <code>{chainId}</code>).
          </p>
        ),
        rpc: {
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        },
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
          await rpc(session.provider, "wallet_switchEthereumChain", [
            { chainId },
          ]);
          await refreshSession();
          const active = await getChainId(session.provider);
          setResult(`Switched — active chainId: ${active}`);
        }
        catch (err) {
          setResult(undefined);
          const message = formatError(err);
          setError(
            message.includes("4902") || message.includes("Unrecognized")
              ? `${message}\n\nChain may need wallet_addEthereumChain first (demo below or grid above).`
              : message,
          );
        }
      }}
    />
  );
}
