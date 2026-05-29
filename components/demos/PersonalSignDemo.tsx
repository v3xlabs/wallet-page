"use client";

import { useState } from "react";

import { eip191MessageHash } from "../../lib/messageHash";
import { rpc } from "../../lib/ethereum";
import { SignMessagePreview } from "../wallet/preview/SignMessagePreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoBlock } from "../wallet/DemoBlock";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const MESSAGE = "wallet.page — personal_sign test";
const MESSAGE_HASH = eip191MessageHash(MESSAGE);

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
      <WalletActionPanel
        inspector={{
          user: <SignMessagePreview message={MESSAGE} />,
          rpc: {
            method: "personal_sign",
            params: [MESSAGE, session?.accounts[0] ?? "0x…"],
          },
          hash: MESSAGE_HASH,
          hashNote: "EIP-191 — wallets hash the prefixed message before secp256k1.",
        }}
        pending={pending}
        actions={[{ label: "Sign message", onClick: sign, primary: true }]}
      >
        <ResultBlock label="Signature" value={signature} error={error} />
      </WalletActionPanel>
    </DemoBlock>
  );
}
