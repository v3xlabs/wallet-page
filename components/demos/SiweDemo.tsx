"use client";

import { useMemo, useState } from "react";
import { eip191MessageHash } from "../../lib/messageHash";
import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { buildSiweMessage, generateSiweNonce } from "../../lib/siwe";
import { SiwePreview } from "../wallet/preview/SiwePreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { useDemoFrame } from "../wallet/DemoFrame";
import { useWallet } from "../wallet/WalletProvider";

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
    catch (err) {
      setError(formatError(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
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
