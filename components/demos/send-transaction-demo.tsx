"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

export function SendTransactionDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tx = {
    from: session?.accounts[0] ?? "0x…",
    to: session?.accounts[0] ?? "0x…",
    value: "0x0" as Hex,
    data: "0x" as Hex,
  };

  const sendSelfTransfer = async () => {
    if (!requireSession()) return;

    setPending(true);
    setTxHash(undefined);
    setError(undefined);

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [
        {
          from: session.accounts[0],
          to: session.accounts[0],
          value: "0x0" as Hex,
          data: "0x" as Hex,
        },
      ]);

      setTxHash(String(hash));
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell source="components/demos/send-transaction-demo.tsx">
      <WalletActionPanel
        inspector={{
          user: (
            <TransactionPreview
              from={tx.from}
              to={tx.to}
              valueLabel="0 ETH"
            />
          ),
          request: { method: "eth_sendTransaction", params: [tx] },
        }}
        response={txHash}
        error={error}
        pending={pending}
        actions={[
          {
            label: "Send test transaction",
            onClick: sendSelfTransfer,
            primary: true,
          },
        ]}
      />
    </DemoShell>
  );
}
