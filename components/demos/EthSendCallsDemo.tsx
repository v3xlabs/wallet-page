"use client";

import { useMemo, useState } from "react";
import type { Hex } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { CallsBatchPreview } from "../wallet/preview/CallsBatchPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const DEMO_CALL = {
  to: "0x0000000000000000000000000000000000000000" as Hex,
  value: "0x0" as const,
};

export function EthSendCallsDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const batchRequest = useMemo(
    () => ({
      version: "1.0",
      chainId: session?.chainId ?? "0x1",
      from: session?.accounts[0] ?? "0x…",
      calls: [DEMO_CALL],
    }),
    [session],
  );

  const sendDemoBatch = async () => {
    if (!requireSession()) return;

    setPending(true);
    setResponse(undefined);
    setError(undefined);
    const request = {
      version: "1.0",
      chainId: session.chainId,
      from: session.accounts[0],
      calls: [DEMO_CALL],
    };

    try {
      const id = await rpc(session.provider, "wallet_sendCalls", [request]);

      try {
        const callStatus = await rpc(
          session.provider,
          "wallet_getCallsStatus",
          [id],
        );

        setResponse(
          JSON.stringify({ batchId: id, status: callStatus }, null, 2),
        );
      }
      catch {
        setResponse(
          JSON.stringify(
            {
              batchId: id,
              status: "wallet_sendCalls succeeded; wallet_getCallsStatus not supported.",
            },
            null,
            2,
          ),
        );
      }
    }
    catch (error_) {
      const message = formatError(error_);

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
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);
    setResponse(undefined);

    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);

      setResponse(JSON.stringify(caps, null, 2));
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={{
          user: (
            <CallsBatchPreview
              chainId={batchRequest.chainId}
              calls={batchRequest.calls}
            />
          ),
          request: { method: "wallet_sendCalls", params: [batchRequest] },
        }}
        response={response}
        error={error}
        pending={pending}
        actions={[
          { label: "Send demo batch", onClick: sendDemoBatch, primary: true },
          { label: "wallet_getCapabilities", onClick: probeCapabilities },
        ]}
      />
    </DemoShell>
  );
}
