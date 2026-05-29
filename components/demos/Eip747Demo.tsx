"use client";

import { useState } from "react";
import type { Address } from "viem";

import { rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function Eip747Demo() {
  const { session } = useWallet();
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const watchAsset = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setResult(undefined);
    try {
      const added = await rpc(session.provider, "wallet_watchAsset", [
        {
          type: "ERC20",
          options: {
            address:
              "0x779877A7B0D9E8603169DdbD7836e478b462Ed970" as Address,
            symbol: "LINK",
            decimals: 18,
            image:
              "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/link.svg",
          },
        },
      ]);
      setResult(
        added ? "Token added to wallet" : "Rejected or not supported",
      );
    }
    catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>wallet_watchAsset (EIP-747)</h3>
        <p className="wallet-demo-muted">
          Suggests Sepolia LINK metadata to the wallet UI.
        </p>
        <button
          type="button"
          className="wallet-demo-btn wallet-demo-btn-primary"
          disabled={pending}
          onClick={() => void watchAsset()}
        >
          Suggest token to wallet
        </button>
        <ResultBlock
          label="Result"
          value={result}
          error={error}
          pending={pending}
        />
      </section>
    </DemoShell>
  );
}
