"use client";

import { useMemo, useState } from "react";

import { eip191MessageHash } from "../../lib/messageHash";
import { rpc } from "../../lib/ethereum";
import { buildSiweMessage, generateSiweNonce } from "../../lib/siwe";
import { SiwePreview } from "../wallet/preview/SiwePreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function SiweDemo() {
  const { session } = useWallet();
  const [nonce, setNonce] = useState(() => generateSiweNonce());
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const previewMessage = useMemo(() => {
    if (!session) return "";
    const chainId = Number.parseInt(session.chainId, 16);
    return buildSiweMessage(session.accounts[0], chainId, nonce);
  }, [session, nonce]);

  const messageHash = useMemo(
    () => (previewMessage ? eip191MessageHash(previewMessage) : undefined),
    [previewMessage],
  );

  const signIn = async () => {
    if (!session) return;
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
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={
          session
            ? {
                user: <SiwePreview message={previewMessage} />,
                rpc: {
                  method: "personal_sign",
                  params: [previewMessage, session.accounts[0]],
                },
                hash: messageHash,
              }
            : undefined
        }
        pending={pending}
        actions={[
          {
            label: "Sign in with Ethereum",
            onClick: signIn,
            primary: true,
            disabled: !session,
          },
        ]}
      >
        <ResultBlock label="Signature" value={signature} error={error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
