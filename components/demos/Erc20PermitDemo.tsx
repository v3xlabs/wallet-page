"use client";

import { useState } from "react";
import { hashTypedData, type Hex } from "viem";

import { rpc, stringifyTypedData } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

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

  const signPermit = async () => {
    if (!session) return;
    setPending(true);
    setSignature(undefined);
    setError(undefined);
    const chainId = Number.parseInt(session.chainId, 16);
    const typed = permitTypedData(session.accounts[0], chainId);
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
    if (!session) return;
    const chainId = Number.parseInt(session.chainId, 16);
    const typed = permitTypedData(session.accounts[0], chainId);
    setSignature(`EIP-712 digest (local): ${hashTypedData(typed)}`);
  };

  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>EIP-2612 permit (off-chain demo)</h3>
        <p className="wallet-demo-muted">
          Exercises <code>eth_signTypedData_v4</code> with a Permit struct.
        </p>
        <div className="wallet-demo-actions">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            disabled={pending}
            onClick={() => void signPermit()}
          >
            Sign permit (typed data)
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            onClick={() => showDigest()}
          >
            Show EIP-712 digest locally
          </button>
        </div>
        <ResultBlock
          label="Signature / output"
          value={signature}
          error={error}
          pending={pending}
        />
      </section>
    </DemoShell>
  );
}
