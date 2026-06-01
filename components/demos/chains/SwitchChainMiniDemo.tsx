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
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();

  const chain = getDemoChain(chainId);

  return (
    <MiniDemo
      title="wallet_switchEthereumChain"
      description={<ChainSelect value={chainId} onChange={setChainId} />}
      actionLabel="Switch chain"
      inspector={{
        user: (
          <p>
            Switch to
            {" "}
            <strong>{chain?.name ?? "network"}</strong>
            {" "}
            (
            <code>{chainId}</code>
            ).
          </p>
        ),
        request: {
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        },
      }}
      response={response}
      error={error}
      onAction={async () => {
        if (!session) return;

        setError(undefined);

        try {
          await rpc(session.provider, "wallet_switchEthereumChain", [
            { chainId },
          ]);
          await refreshSession();
          const active = await getChainId(session.provider);

          setResponse(active);
        }
        catch (error_) {
          setResponse(undefined);
          const message = formatError(error_);

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
