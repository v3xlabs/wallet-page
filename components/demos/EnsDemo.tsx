"use client";

import { useState } from "react";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

import { formatError } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { useWallet } from "../wallet/WalletProvider";

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum.publicnode.com"),
});

export function EnsDemo() {
  const { session } = useWallet();

  const [forwardName, setForwardName] = useState("vitalik.eth");
  const [forwardResult, setForwardResult] = useState<string>();
  const [forwardError, setForwardError] = useState<string>();
  const [forwardPending, setForwardPending] = useState(false);

  const [reverseAddress, setReverseAddress] = useState(
    session?.accounts[0] ?? "",
  );
  const [reverseResult, setReverseResult] = useState<string>();
  const [reverseError, setReverseError] = useState<string>();
  const [reversePending, setReversePending] = useState(false);

  const lookupForward = async () => {
    const name = forwardName.trim();

    if (!name) return;

    setForwardPending(true);
    setForwardResult(undefined);
    setForwardError(undefined);

    try {
      const address = await ensClient.getEnsAddress({ name: normalize(name) });

      setForwardResult(address ?? "No address registered for this name.");
    }
    catch (error) {
      setForwardError(formatError(error));
    }
    finally {
      setForwardPending(false);
    }
  };

  const lookupReverse = async () => {
    const addr = reverseAddress.trim();

    if (!isAddress(addr)) {
      setReverseError("Enter a valid checksummed address.");

      return;
    }

    setReversePending(true);
    setReverseResult(undefined);
    setReverseError(undefined);

    try {
      const name = await ensClient.getEnsName({ address: addr as Address });

      setReverseResult(name ?? "No primary name set for this address.");
    }
    catch (error) {
      setReverseError(formatError(error));
    }
    finally {
      setReversePending(false);
    }
  };

  return (
    <DemoShell>
      <p className="wallet-demo-muted" style={{ marginBottom: "1.25rem" }}>
        Resolves against Ethereum mainnet via a public RPC.
      </p>

      {/* Forward lookup */}
      <div className="wallet-demo-section">
        <h3 className="wallet-demo-section-title">Forward lookup</h3>
        <p className="wallet-demo-muted">name → address</p>
        <label className="wallet-demo-field">
          <span className="wallet-demo-muted">ENS name</span>
          <input
            type="text"
            className="wallet-demo-input"
            value={forwardName}
            onChange={e => setForwardName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void lookupForward()}
            placeholder="vitalik.eth"
          />
        </label>
        <div className="wallet-action-footer">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            onClick={() => void lookupForward()}
            disabled={forwardPending || !forwardName.trim()}
          >
            {forwardPending ? "Resolving…" : "Resolve name"}
          </button>
        </div>
        {(forwardResult || forwardError) && (
          <div
            className={`wallet-demo-result${forwardError ? " wallet-demo-result-error" : " wallet-demo-result-ok"}`}
            style={{ marginTop: "0.75rem" }}
          >
            <div className="wallet-demo-result-label">Address</div>
            <pre>{forwardError ?? forwardResult}</pre>
          </div>
        )}
      </div>

      {/* Reverse lookup */}
      <div className="wallet-demo-section">
        <h3 className="wallet-demo-section-title">Reverse lookup</h3>
        <p className="wallet-demo-muted">address → primary name</p>
        <label className="wallet-demo-field">
          <span className="wallet-demo-muted">Ethereum address</span>
          <input
            type="text"
            className="wallet-demo-input"
            value={reverseAddress}
            onChange={e => setReverseAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void lookupReverse()}
            placeholder="0x…"
          />
        </label>
        {session && reverseAddress !== session.accounts[0] && (
          <button
            type="button"
            className="wallet-demo-btn"
            style={{ marginTop: "0.35rem" }}
            onClick={() => setReverseAddress(session.accounts[0])}
          >
            Use wallet address
          </button>
        )}
        <div className="wallet-action-footer">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            onClick={() => void lookupReverse()}
            disabled={reversePending || !reverseAddress.trim()}
          >
            {reversePending ? "Resolving…" : "Resolve address"}
          </button>
        </div>
        {(reverseResult || reverseError) && (
          <div
            className={`wallet-demo-result${reverseError ? " wallet-demo-result-error" : " wallet-demo-result-ok"}`}
            style={{ marginTop: "0.75rem" }}
          >
            <div className="wallet-demo-result-label">Primary name</div>
            <pre>{reverseError ?? reverseResult}</pre>
          </div>
        )}
      </div>
    </DemoShell>
  );
}
