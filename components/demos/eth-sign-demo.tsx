"use client";

import { useState } from "react";

import { formatError, rpc } from "../../lib/ethereum";
import { DemoBlock } from "../wallet/DemoBlock";
import { useDemoFrame } from "../wallet/DemoFrame";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const ZERO_HASH = `0x${"00".repeat(32)}`;

export function EthSignDemo() {
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
      const sig = await rpc(session.provider, "eth_sign", [
        session.accounts[0],
        ZERO_HASH,
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
    <DemoBlock source="components/demos/eth-sign-demo.tsx">
      <WalletActionPanel
        inspector={{
          user: (
            <>
              <p className="mb-2 text-sm leading-snug text-warning">
                Not human-readable — wallets should warn before signing a raw hash.
              </p>
              <code className="block font-mono text-xs break-all whitespace-pre-wrap">{ZERO_HASH}</code>
            </>
          ),
          request: {
            method: "eth_sign",
            params: [session?.accounts[0] ?? "0x…", ZERO_HASH],
          },
          hash: ZERO_HASH,
          hashNote: "eth_sign — wallet signs this 32-byte value (no EIP-191 prefix).",
        }}
        response={signature}
        error={error}
        pending={pending}
        actions={[{ label: "Sign hash", onClick: sign, primary: true }]}
      />
    </DemoBlock>
  );
}
