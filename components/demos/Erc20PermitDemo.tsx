"use client";

import { useMemo, useState } from "react";
import { hashTypedData, type Hex } from "viem";

import { rpc, stringifyTypedData } from "../../lib/ethereum";
import { PermitPreview } from "../wallet/preview/PermitPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
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
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const typed = useMemo(() => {
    if (!session) return null;
    const chainId = Number.parseInt(session.chainId, 16);
    return permitTypedData(session.accounts[0], chainId);
  }, [session]);

  const digest = useMemo(
    () => (typed ? hashTypedData(typed) : null),
    [typed],
  );

  const signPermit = async () => {
    if (!session || !typed) return;
    setPending(true);
    setSignature(undefined);
    setError(undefined);
    try {
      const sig = await rpc(session.provider, "eth_signTypedData_v4", [
        session.accounts[0],
        stringifyTypedData(typed),
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

  const showDigest = () => {
    if (!digest) return;
    setSignature(digest);
    setError(undefined);
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={
          typed
            ? {
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
                rpc: {
                  method: "eth_signTypedData_v4",
                  params: [session!.accounts[0], stringifyTypedData(typed)],
                },
                hash: digest,
                hashNote: "EIP-712 digest — second param to eth_signTypedData_v4 is the typed JSON.",
              }
            : undefined
        }
        pending={pending}
        actions={[
          { label: "Sign permit", onClick: signPermit, primary: true, disabled: !session },
          { label: "Copy digest", onClick: showDigest, disabled: !session },
        ]}
      >
        <ResultBlock label="Signature" value={signature} error={error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
