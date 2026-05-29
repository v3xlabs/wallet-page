"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { formatError, getChainId, rpc } from "../../../lib/ethereum";
import { MiniDemo } from "../../wallet/MiniDemo";
import { useWallet } from "../../wallet/WalletProvider";
import { ChainSelect } from "./ChainSelect";

export function SwitchChainMiniDemo() {
  const { session, refreshSession } = useWallet();
  const [chainId, setChainId] = useState<Hex>("0xaa36a7");
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();

  return (
    <MiniDemo
      title="wallet_switchEthereumChain"
      description={
        <>
          EIP-3326 — <code>wallet_switchEthereumChain</code> with{" "}
          <code>{`{ chainId }`}</code>.
          <ChainSelect value={chainId} onChange={setChainId} />
        </>
      }
      actionLabel="Switch chain"
      idleHint={
        session
          ? "Pick a network, then switch."
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
