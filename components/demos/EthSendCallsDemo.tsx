"use client";

import { useMemo, useState } from "react";
import type { Hex } from "viem";

import { rpc } from "../../lib/ethereum";
import { CallsBatchPreview } from "../wallet/preview/CallsBatchPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const DEMO_CALL = {
  to: "0x0000000000000000000000000000000000000000" as Hex,
  value: "0x0" as const,
};

export function EthSendCallsDemo() {
  const { session } = useWallet();
  const [batchId, setBatchId] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const batchRequest = useMemo(() => {
    if (!session) return null;
    return {
      version: "1.0",
      chainId: session.chainId,
      from: session.accounts[0],
      calls: [DEMO_CALL],
    };
  }, [session]);

  const sendDemoBatch = async () => {
    if (!session || !batchRequest) return;
    setPending(true);
    setBatchId(undefined);
    setStatus(undefined);
    setError(undefined);
    try {
      const id = await rpc(session.provider, "wallet_sendCalls", [batchRequest]);
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
      <WalletActionPanel
        inspector={
          batchRequest
            ? {
                user: (
                  <CallsBatchPreview
                    chainId={batchRequest.chainId}
                    calls={batchRequest.calls}
                  />
                ),
                rpc: { method: "wallet_sendCalls", params: [batchRequest] },
              }
            : undefined
        }
        pending={pending}
        actions={[
          { label: "Send demo batch", onClick: sendDemoBatch, primary: true, disabled: !session },
          { label: "wallet_getCapabilities", onClick: probeCapabilities, disabled: !session },
        ]}
      >
        <ResultBlock label="Batch id" value={batchId} />
        <ResultBlock label="Status / capabilities" value={status} error={error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
