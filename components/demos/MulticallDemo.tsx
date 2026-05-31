"use client";

import { useMemo, useState } from "react";
import {
  decodeAbiParameters,
  encodeFunctionData,
  formatEther,
  parseAbi,
  parseAbiParameters,
  type Address,
  type Hex,
} from "viem";

import { rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { useWallet } from "../wallet/WalletProvider";

export const MULTICALL3_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11" as Address;

const MULTICALL3_ABI = parseAbi([
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) external payable returns ((bool success, bytes returnData)[] returnData)",
  "function getEthBalance(address addr) public view returns (uint256 balance)",
]);

const WETH_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
]);

const WETH_BY_CHAIN: Record<string, Address> = {
  "0x1":      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xaa36a7": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  "0x4268":   "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
  "0x2105":   "0x4200000000000000000000000000000000000006",
  "0xa":      "0x4200000000000000000000000000000000000006",
  "0xa4b1":   "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

type BatchResult = { label: string; value: string; success: boolean };

export function MulticallDemo() {
  const { session } = useWallet();
  const [results, setResults] = useState<BatchResult[]>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const wethAddress = session
    ? WETH_BY_CHAIN[session.chainId.toLowerCase() as Hex]
    : undefined;

  const calls = useMemo(() => {
    if (!session) return [];
    const account = session.accounts[0];
    const list: { label: string; target: Address; callData: Hex }[] = [
      {
        label: "ETH balance",
        target: MULTICALL3_ADDRESS,
        callData: encodeFunctionData({
          abi: MULTICALL3_ABI,
          functionName: "getEthBalance",
          args: [account],
        }),
      },
    ];
    if (wethAddress) {
      list.push({
        label: "WETH balance",
        target: wethAddress,
        callData: encodeFunctionData({
          abi: WETH_ABI,
          functionName: "balanceOf",
          args: [account],
        }),
      });
    }
    return list;
  }, [session, wethAddress]);

  const runBatch = async () => {
    if (!session || calls.length === 0) return;
    setPending(true);
    setError(undefined);
    setResults(undefined);
    try {
      const callData = encodeFunctionData({
        abi: MULTICALL3_ABI,
        functionName: "aggregate3",
        args: [calls.map((c) => ({ target: c.target, allowFailure: true, callData: c.callData }))],
      });

      const raw = await rpc(session.provider, "eth_call", [
        { to: MULTICALL3_ADDRESS, data: callData },
        "latest",
      ]) as Hex;

      // aggregate3 returns (bool success, bytes returnData)[]
      const [[...returnValues]] = decodeAbiParameters(
        parseAbiParameters("(bool success, bytes returnData)[]"),
        raw,
      ) as [Array<{ success: boolean; returnData: Hex }>];

      const decoded: BatchResult[] = returnValues.map((r, i) => {
        const label = calls[i]?.label ?? `Call ${i}`;
        if (!r.success || r.returnData === "0x") {
          return { label, value: "call failed", success: false };
        }
        try {
          const [val] = decodeAbiParameters(parseAbiParameters("uint256"), r.returnData);
          return { label, value: `${formatEther(val as bigint)} ETH`, success: true };
        } catch {
          return { label, value: r.returnData, success: true };
        }
      });

      setResults(decoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  const inspectorRpc = session && calls.length > 0
    ? {
        method: "eth_call",
        params: [{
          to: MULTICALL3_ADDRESS,
          data: encodeFunctionData({
            abi: MULTICALL3_ABI,
            functionName: "aggregate3",
            args: [calls.map((c) => ({ target: c.target, allowFailure: true, callData: c.callData }))],
          }),
        }, "latest"],
      }
    : undefined;

  return (
    <DemoShell>
      <p className="wallet-demo-muted">
        Multicall3:{" "}
        <code>{MULTICALL3_ADDRESS}</code>
      </p>
      <p className="wallet-demo-muted" style={{ marginTop: "0.35rem" }}>
        Batching{" "}
        <strong>{calls.length} call{calls.length !== 1 ? "s" : ""}</strong>{" "}
        into one <code>eth_call</code>:
        {calls.map((c) => (
          <span key={c.label}> <code>{c.label}</code></span>
        ))}
      </p>

      <div className="wallet-action-panel">
        {inspectorRpc && (
          <div className="wallet-demo-section">
            <details className="wallet-demo-details">
              <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--vocs-text-color-secondary)" }}>
                View RPC call
              </summary>
              <pre className="wallet-demo-log" style={{ marginTop: "0.5rem" }}>
                {JSON.stringify(inspectorRpc, null, 2)}
              </pre>
            </details>
          </div>
        )}
        <div className="wallet-action-footer">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            onClick={() => void runBatch()}
            disabled={pending || !session || calls.length === 0}
          >
            {pending ? "Fetching…" : "Run batch"}
          </button>
        </div>

        {error && (
          <div className="wallet-demo-result wallet-demo-result-error" style={{ marginTop: "0.75rem" }}>
            <div className="wallet-demo-result-label">Error</div>
            <pre>{error}</pre>
          </div>
        )}

        {results && (
          <div className="wallet-demo-result wallet-demo-result-ok" style={{ marginTop: "0.75rem" }}>
            <div className="wallet-demo-result-label">
              {results.length} result{results.length !== 1 ? "s" : ""} — 1 RPC round trip
            </div>
            {results.map((r) => (
              <div key={r.label} style={{ display: "flex", gap: "0.75rem", marginTop: "0.35rem", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--vocs-text-color-secondary)", minWidth: "8rem" }}>
                  {r.label}
                </span>
                <pre style={{ margin: 0, color: r.success ? undefined : "var(--vocs-color-destructive)" }}>
                  {r.value}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </DemoShell>
  );
}
