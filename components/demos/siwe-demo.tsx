"use client";

import { useMemo, useState } from "react";

import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { eip191MessageHash } from "../../lib/messageHash";
import { buildSiweMessage, generateSiweNonce, parseSiweMessage } from "../../lib/siwe";
import { Address } from "../wallet/address";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const SiwePreview = ({ message }: { message: string; }) => {
  const parsed = message ? parseSiweMessage(message) : null;

  if (!parsed?.address || !parsed.domain) {
    return <pre className="font-mono text-xs break-all whitespace-pre-wrap">{message}</pre>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="leading-normal">
        <strong>{parsed.domain}</strong>
        {" "}
        wants you to sign in with
        {" "}
        <Address address={parsed.address} />
      </p>
      {parsed.statement && (
        <blockquote className="rounded-md border border-primary border-l-[3px] border-l-accent bg-accent/10 px-3 py-2.5 text-sm leading-normal whitespace-pre-wrap text-primary">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.05em] uppercase text-accent">Statement</span>
          {parsed.statement}
        </blockquote>
      )}
      <dl className="m-0 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="m-0 text-[11px] tracking-[0.04em] uppercase text-secondary">URI</dt>
          <dd className="m-0 text-right break-all">{parsed.uri}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="m-0 text-[11px] tracking-[0.04em] uppercase text-secondary">Chain</dt>
          <dd className="m-0 text-right break-all">{parsed.chainId}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="m-0 text-[11px] tracking-[0.04em] uppercase text-secondary">Nonce</dt>
          <dd className="m-0 text-right font-mono text-[0.85em] break-all text-secondary">{parsed.nonce}</dd>
        </div>
      </dl>
    </div>
  );
};

export const SiweDemo = () => {
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
};
