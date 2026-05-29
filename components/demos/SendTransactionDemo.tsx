"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function SendTransactionDemo() {
  const { session } = useWallet();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const sendSelfTransfer = async () => {
    if (!session) return;
    setPending(true);
    setTxHash(undefined);
    setError(undefined);
    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [
        {
          from: session.accounts[0],
          to: session.accounts[0],
          value: "0x0",
          data: "0x" as Hex,
        },
      ]);
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
      <section className="wallet-demo-section">
        <h3>eth_sendTransaction</h3>
        <p className="wallet-demo-muted">
          Zero-value transaction to your own address — confirms broadcast support.
        </p>
        <button
          type="button"
          className="wallet-demo-btn wallet-demo-btn-primary"
          disabled={pending}
          onClick={() => void sendSelfTransfer()}
        >
          Send test transaction
        </button>
        <ResultBlock
          label="Transaction hash"
          value={txHash}
          error={error}
          pending={pending}
        />
      </section>
    </DemoShell>
  );
}
