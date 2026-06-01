"use client";

import { useState } from "react";

import { formatError, rpc } from "../../lib/ethereum";
import { eip191MessageHash } from "../../lib/messageHash";
import { DemoBlock } from "../wallet/DemoBlock";
import { useDemoFrame } from "../wallet/DemoFrame";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const MESSAGE = "wallet.page — personal_sign test";
const MESSAGE_HASH = eip191MessageHash(MESSAGE);

export function PersonalSignDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const sign = async () => {
    if (!requireSession()) return;

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
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoBlock source="components/demos/personal-sign-demo.tsx">
      <WalletActionPanel
        inspector={{
          user: <p className="wallet-preview-message">{MESSAGE}</p>,
          request: {
            method: "personal_sign",
            params: [MESSAGE, session?.accounts[0] ?? "0x…"],
          },
          hash: MESSAGE_HASH,
          hashNote: "EIP-191 — wallets hash the prefixed message before secp256k1.",
        }}
        response={signature}
        error={error}
        pending={pending}
        actions={[{ label: "Sign message", onClick: sign, primary: true }]}
      />
    </DemoBlock>
  );
}
