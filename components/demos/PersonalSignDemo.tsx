"use client";

import { useState } from "react";

import { rpc } from "../../lib/ethereum";
import { DemoBlock } from "../wallet/DemoBlock";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const MESSAGE = "wallet.page — personal_sign test";

export function PersonalSignDemo() {
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
      const sig = await rpc(session.provider, "personal_sign", [
        MESSAGE,
        session.accounts[0],
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
          Sign message
        </button>
        <ResultBlock
          label="Signature"
          pending={pending}
          value={signature}
          error={error}
        />
        <p className="wallet-demo-muted text-sm">
          Message: <code>{MESSAGE}</code>
        </p>
      </section>
    </DemoBlock>
  );
}
