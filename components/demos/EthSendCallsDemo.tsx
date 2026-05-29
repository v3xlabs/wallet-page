"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function EthSendCallsDemo() {
  const { session } = useWallet();
  const [batchId, setBatchId] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const sendDemoBatch = async () => {
    if (!session) return;
    setPending(true);
    setBatchId(undefined);
    setStatus(undefined);
    setError(undefined);
    try {
      const id = await rpc(session.provider, "wallet_sendCalls", [
        {
          version: "1.0",
          chainId: session.chainId,
          from: session.accounts[0],
          calls: [
            {
              to: "0x0000000000000000000000000000000000000000",
              value: "0x0",
            },
          ],
        },
      ]);
      setBatchId(String(id));
      try {
        const callStatus = await rpc(
          session.provider,
          "wallet_getCallsStatus",
          [id],
        );
        setStatus(JSON.stringify(callStatus, null, 2));
      }
      catch {
        setStatus(
          "wallet_sendCalls succeeded; wallet_getCallsStatus not supported.",
        );
      }
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("not found")
        || message.includes("Unsupported")
        || message.includes("-32601")
          ? `${message}\n\nImplementing EIP-5792 (wallet_sendCalls / wallet_getCapabilities) is recommended — this response usually means those RPCs are not wired up yet.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  const probeCapabilities = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setStatus(undefined);
    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);
      setStatus(JSON.stringify(caps, null, 2));
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
        <h3>wallet_sendCalls (EIP-5792)</h3>
        <p className="wallet-demo-muted">
          Batch calls through the wallet with a single confirmation when supported.
        </p>
        <div className="wallet-demo-actions">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            disabled={pending}
            onClick={() => void sendDemoBatch()}
          >
            Send demo batch
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void probeCapabilities()}
          >
            wallet_getCapabilities
          </button>
        </div>
        <ResultBlock label="Batch id" value={batchId} pending={pending && !batchId && !error} />
        <ResultBlock label="Status / capabilities" value={status} error={error} />
      </section>
    </DemoShell>
  );
}
