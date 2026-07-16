"use client";

import { useMemo, useState } from "react";
import { hashTypedData, type Hex } from "viem";

import { formatDeadline, formatTokenAmount } from "../../lib/display";
import {
  DEMO_PLACEHOLDER_ACCOUNT,
  formatError,
  rpc,
  stringifyRpcData,
} from "../../lib/ethereum";
import { Address } from "../wallet/address";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const DEMO_DECIMALS = 6;
const DEMO_SYMBOL = "WPAGE";

type PermitPreviewProps = {
  tokenName: string;
  tokenSymbol: string;
  decimals?: number;
  value: bigint;
  spender: string;
  deadline: bigint;
};

const PermitPreview = ({
  tokenName,
  tokenSymbol,
  decimals = 6,
  value,
  spender,
  deadline,
}: PermitPreviewProps) => {
  const amount = formatTokenAmount(value, decimals, tokenSymbol);
  const iconLetter = (tokenSymbol ?? tokenName ?? "T").slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[1.1rem] font-bold"
          aria-hidden
        >
          {iconLetter}
        </span>
        <div>
          <p className="text-[1.05rem] font-semibold">{amount}</p>
          <p className="mt-0.5 text-sm text-secondary">{tokenName}</p>
        </div>
      </div>
      <dl className="m-0 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="m-0 text-[11px] uppercase tracking-[0.04em] text-secondary">Spender</dt>
          <dd className="m-0 break-all text-right"><Address address={spender} /></dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="m-0 text-[11px] uppercase tracking-[0.04em] text-secondary">Expires</dt>
          <dd className="m-0 break-all text-right">{formatDeadline(deadline)}</dd>
        </div>
      </dl>
    </div>
  );
};

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

export const Erc20PermitDemo = () => {
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
        stringifyRpcData(liveTyped),
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

  const showDigest = () => {
    setSignature(digest);
    setError(undefined);
  };

  return (
    <DemoShell source="components/demos/erc-20-permit-demo.tsx">
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
            params: [session?.accounts[0] ?? "0x…", stringifyRpcData(typed)],
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
};
