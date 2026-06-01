"use client";

import { useMemo, useState } from "react";
import { hashTypedData, type Hex } from "viem";

import {
  DEMO_PLACEHOLDER_ACCOUNT,
  formatError,
  rpc,
  stringifyTypedData,
} from "../../lib/ethereum";
import { PermitPreview } from "../wallet/preview/PermitPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { useDemoFrame } from "../wallet/DemoFrame";
import { useWallet } from "../wallet/WalletProvider";

const DEMO_DECIMALS = 6;
const DEMO_SYMBOL = "WPAGE";

const permitTypedData = (owner: Hex, chainId: number) =>
  ({
    domain: {
      name: "wallet.page Demo Token",
      version: "1",
      chainId,
      verifyingContract: "0x0000000000000000000000000000000000000001" as const,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit" as const,
    message: {
      owner,
      spender: "0x0000000000000000000000000000000000000002" as const,
      value: 1_000_000n,
      nonce: 0n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
    },
  }) as const;

export function Erc20PermitDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const typed = useMemo(() => {
    const chainId = session
      ? Number.parseInt(session.chainId, 16)
      : 1;
    return permitTypedData(session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT, chainId);
  }, [session]);

  const digest = useMemo(() => hashTypedData(typed), [typed]);

  const signPermit = async () => {
    if (!requireSession()) return;
    setPending(true);
    setSignature(undefined);
    setError(undefined);
    const liveTyped = permitTypedData(
      session.accounts[0],
      Number.parseInt(session.chainId, 16),
    );
    try {
      const sig = await rpc(session.provider, "eth_signTypedData_v4", [
        session.accounts[0],
        stringifyTypedData(liveTyped),
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

  const showDigest = () => {
    setSignature(digest);
    setError(undefined);
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={{
          user: (
            <PermitPreview
              tokenName={typed.domain.name}
              tokenSymbol={DEMO_SYMBOL}
              decimals={DEMO_DECIMALS}
              value={typed.message.value}
              spender={typed.message.spender}
              deadline={typed.message.deadline}
            />
          ),
          request: {
            method: "eth_signTypedData_v4",
            params: [session?.accounts[0] ?? "0x…", stringifyTypedData(typed)],
          },
          hash: digest,
          hashNote: "EIP-712 digest — second param to eth_signTypedData_v4 is the typed JSON.",
        }}
        response={signature}
        error={error}
        pending={pending}
        actions={[
          { label: "Sign permit", onClick: signPermit, primary: true },
          { label: "Copy digest", onClick: showDigest },
        ]}
      />
    </DemoShell>
  );
}
