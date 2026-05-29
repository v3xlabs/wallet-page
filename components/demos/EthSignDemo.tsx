"use client";

import { useState } from "react";

import { rpc } from "../../lib/ethereum";
import { DemoBlock } from "../wallet/DemoBlock";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const ZERO_HASH = `0x${"00".repeat(32)}`;

export function EthSignDemo() {
  const { session } = useWallet();
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const sign = async () => {
    if (!session) return;
    setPending(true);
    setSignature(undefined);
    setError(undefined);
    try {
      const sig = await rpc(session.provider, "eth_sign", [
        session.accounts[0],
        ZERO_HASH,
      ]);
      setSignature(String(sig));
    }
    catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoBlock>
      <section className="wallet-demo-section">
        <button
          type="button"
          className="wallet-demo-btn wallet-demo-btn-primary"
          disabled={pending}
          onClick={() => void sign()}
        >
          Sign hash with eth_sign
        </button>
        <ResultBlock
          label="Signature"
          pending={pending}
          value={signature}
          error={error}
        />
        <p className="wallet-demo-muted text-sm">
          Hash: <code>{ZERO_HASH}</code>
        </p>
      </section>
    </DemoBlock>
  );
}
