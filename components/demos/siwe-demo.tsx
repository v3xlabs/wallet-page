"use client";

import { useMemo, useState } from "react";

import { shortAddress } from "../../lib/display";
import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { eip191MessageHash } from "../../lib/messageHash";
import { buildSiweMessage, generateSiweNonce, parseSiweMessage } from "../../lib/siwe";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

function SiwePreview({ message }: { message: string; }) {
  const parsed = message ? parseSiweMessage(message) : null;

  if (!parsed?.address || !parsed.domain) {
    return <pre className="wallet-preview-raw">{message}</pre>;
  }

  return (
    <>
      <p className="wallet-preview-siwe-lead">
        <strong>{parsed.domain}</strong>
        {" "}
        · sign in as
        {" "}
        <code>{shortAddress(parsed.address, 6)}</code>
      </p>
      {parsed.statement && (
        <p className="wallet-preview-siwe-statement">{parsed.statement}</p>
      )}
      <dl className="wallet-preview-meta">
        <div>
          <dt>URI</dt>
          <dd>{parsed.uri}</dd>
        </div>
        <div>
          <dt>Chain</dt>
          <dd>{parsed.chainId}</dd>
        </div>
        <div>
          <dt>Nonce</dt>
          <dd>
            <code>{parsed.nonce}</code>
          </dd>
        </div>
      </dl>
    </>
  );
}

export function SiweDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [nonce, setNonce] = useState(() => generateSiweNonce());
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const previewMessage = useMemo(() => {
    if (!session) return buildSiweMessage(DEMO_PLACEHOLDER_ACCOUNT, 1, nonce);

    const chainId = Number.parseInt(session.chainId, 16);

    return buildSiweMessage(session.accounts[0], chainId, nonce);
  }, [session, nonce]);

  const messageHash = useMemo(
    () => (previewMessage ? eip191MessageHash(previewMessage) : undefined),
    [previewMessage],
  );

  const signIn = async () => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);
    setSignature(undefined);
    const freshNonce = generateSiweNonce();

    setNonce(freshNonce);
    const chainId = Number.parseInt(session.chainId, 16);
    const siweMessage = buildSiweMessage(
      session.accounts[0],
      chainId,
      freshNonce,
    );

    try {
      const sig = await rpc(session.provider, "personal_sign", [
        siweMessage,
        session.accounts[0],
      ]);

      setSignature(String(sig));
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell source="components/demos/siwe-demo.tsx">
      <WalletActionPanel
        inspector={{
          user: <SiwePreview message={previewMessage} />,
          request: {
            method: "personal_sign",
            params: [previewMessage, session?.accounts[0] ?? "0x…"],
          },
          hash: messageHash,
        }}
        response={signature}
        error={error}
        pending={pending}
        actions={[
          {
            label: "Sign in with Ethereum",
            onClick: signIn,
            primary: true,
          },
        ]}
      />
    </DemoShell>
  );
}
