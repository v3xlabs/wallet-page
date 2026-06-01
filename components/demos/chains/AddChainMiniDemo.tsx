"use client";

import { useMemo, useState } from "react";
import type { Hex } from "viem";

import { getDemoChain } from "../../../lib/chains";
import { formatError, rpc } from "../../../lib/ethereum";
import { MiniDemo } from "../../wallet/MiniDemo";
import { useWallet } from "../../wallet/WalletProvider";
import { ChainSelect } from "./ChainSelect";

export function AddChainMiniDemo() {
  const { session, refreshSession } = useWallet();
  const [chainId, setChainId] = useState<Hex>("0xaa36a7");
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();

  const meta = getDemoChain(chainId);

  const addParams = useMemo(() => {
    if (!meta) return null;

    return {
      chainId: meta.chainId,
      chainName: meta.name,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: [meta.rpcUrl],
    };
  }, [meta]);

  return (
    <MiniDemo
      title="wallet_addEthereumChain"
      description={<ChainSelect value={chainId} onChange={setChainId} />}
      actionLabel="Add chain"
      inspector={
        meta && addParams
          ? {
              user: (
                <p>
                  Register
                  {" "}
                  <strong>{meta.name}</strong>
                  {" "}
                  in the wallet (RPC + currency).
                </p>
              ),
              request: { method: "wallet_addEthereumChain", params: [addParams] },
            }
          : undefined
      }
      response={response}
      error={error}
      onAction={async () => {
        if (!session) return;

        if (!addParams) {
          setError("Unknown demo chain.");

          return;
        }

        setError(undefined);

        try {
          await rpc(session.provider, "wallet_addEthereumChain", [addParams]);
          await refreshSession();
          setResponse(`Added ${meta!.name} (${meta!.chainId}).`);
        }
        catch (error_) {
          setResponse(undefined);
          setError(formatError(error_));
        }
      }}
    />
  );
}
