"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { rpc } from "../../lib/ethereum";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function SendTransactionDemo() {
  const { session } = useWallet();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tx = session
    ? {
        from: session.accounts[0],
        to: session.accounts[0],
        value: "0x0" as Hex,
        data: "0x" as Hex,
      }
    : null;

  const sendSelfTransfer = async () => {
    if (!session || !tx) return;
    setPending(true);
    setTxHash(undefined);
    setError(undefined);
    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [tx]);
      setTxHash(String(hash));
    }
    catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={
          tx
            ? {
                user: (
                  <TransactionPreview
                    from={tx.from}
                    to={tx.to}
                    valueLabel="0 ETH"
                  />
                ),
                rpc: { method: "eth_sendTransaction", params: [tx] },
              }
            : undefined
        }
        pending={pending}
        actions={[
          {
            label: "Send test transaction",
            onClick: sendSelfTransfer,
            primary: true,
            disabled: !session,
          },
        ]}
      >
        <ResultBlock label="Transaction hash" value={txHash} error={error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
