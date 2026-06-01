"use client";

import { useMemo, useState } from "react";
import { encodeFunctionData, type Hex, parseAbi, parseUnits } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { Address } from "../wallet/address";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const WETH_ABI = parseAbi([
  "function deposit() payable",
  "function withdraw(uint256 wad)",
  "function balanceOf(address) view returns (uint256)",
]);

const WRAP_ETH = {
  to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Hex,
  data: encodeFunctionData({ abi: WETH_ABI, functionName: "deposit" }),
  value: parseUnits("0.001", 18),
};

const UNWRAP_ETH = {
  to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Hex,
  data: encodeFunctionData({ abi: WETH_ABI, functionName: "withdraw", args: [parseUnits("0.001", 18)] }),
  value: "0x0" as const,
};

function CallsBatchPreview({
  chainId,
  calls,
}: {
  chainId: string;
  calls: { to: string; value?: string; }[];
}) {
  return (
    <ul className="wallet-preview-batch-list">
      {calls.map((call, i) => (
        <li key={`${call.to}-${i}`}>
          <span className="wallet-preview-batch-index">{i + 1}</span>
          <Address address={call.to} />
          <span className="wallet-demo-muted">
            chain
            {" "}
            <code>{chainId}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

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
      calls: [WRAP_ETH, UNWRAP_ETH],
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
      calls: [WRAP_ETH, UNWRAP_ETH],
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
    <DemoShell source="components/demos/eth-send-calls-demo.tsx">
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
          { label: "Send batch", onClick: sendDemoBatch, primary: true },
          { label: "wallet_getCapabilities", onClick: probeCapabilities },
        ]}
      />
    </DemoShell>
  );
}
