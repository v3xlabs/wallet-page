"use client";

import { useState } from "react";

import { rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

function buildSiweMessage(address: string, chainId: number) {
  const domain = window.location.host;
  const uri = window.location.origin;
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const issuedAt = new Date().toISOString();
  return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to wallet.page demos.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

export function SiweDemo() {
  const { session } = useWallet();
  const [message, setMessage] = useState<string>();
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setSignature(undefined);
    const chainId = Number.parseInt(session.chainId, 16);
    const siweMessage = buildSiweMessage(session.accounts[0], chainId);
    setMessage(siweMessage);
    try {
      const sig = await rpc(session.provider, "personal_sign", [
        siweMessage,
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
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>Sign-In with Ethereum (EIP-4361)</h3>
        <p className="wallet-demo-muted">
          Builds a SIWE message and signs it with <code>personal_sign</code>.
        </p>
        <button
          type="button"
          className="wallet-demo-btn wallet-demo-btn-primary"
          disabled={pending}
          onClick={() => void signIn()}
        >
          Sign in with Ethereum
        </button>
        <ResultBlock label="Message" value={message} pending={pending && !message} />
        <ResultBlock
          label="Signature"
          value={signature}
          error={error}
          pending={pending && !signature && !error}
        />
      </section>
    </DemoShell>
  );
}
