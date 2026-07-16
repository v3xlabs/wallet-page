"use client";

import { useMemo, useState } from "react";
import {
  type Address as EvmAddress,
  decodeAbiParameters,
  encodeFunctionData,
  formatEther,
  type Hex,
  parseAbi,
  parseAbiParameters,
} from "viem";

import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { Address } from "../wallet/address";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

export const MULTICALL3_ADDRESS
  = "0xcA11bde05977b3631167028862bE2a173976CA11" as EvmAddress;

const MULTICALL3_ABI = parseAbi([
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) external payable returns ((bool success, bytes returnData)[] returnData)",
  "function getEthBalance(address addr) public view returns (uint256 balance)",
]);

const WETH_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
]);

const WETH_BY_CHAIN: Record<string, EvmAddress> = {
  "0x1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xaa36a7": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  "0x4268": "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
  "0x2105": "0x4200000000000000000000000000000000000006",
  "0xa": "0x4200000000000000000000000000000000000006",
  "0xa4b1": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

type BatchResult = { label: string; value: string; success: boolean; };

export const MulticallDemo = () => {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<BatchResult[]>();

  const wethAddress = session
    ? WETH_BY_CHAIN[session.chainId.toLowerCase() as Hex]
    : undefined;

  const calls = useMemo(() => {
    const account = session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT;
    const list: { label: string; target: EvmAddress; callData: Hex; }[] = [
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

  const requestCall = useMemo(() => {
    if (calls.length === 0) return null;

    return {
      to: MULTICALL3_ADDRESS,
      data: encodeFunctionData({
        abi: MULTICALL3_ABI,
        functionName: "aggregate3",
        args: [calls.map(c => ({ target: c.target, allowFailure: true, callData: c.callData }))],
      }),
    };
  }, [calls]);

  const runBatch = async () => {
    if (!requireSession() || calls.length === 0 || !requestCall) return;

    setPending(true);
    setError(undefined);
    setResponse(undefined);
    setPreview(undefined);

    try {
      const raw = await rpc(session.provider, "eth_call", [
        requestCall,
        "latest",
      ]) as Hex;

      const [[...returnValues]] = decodeAbiParameters(
        parseAbiParameters("(bool success, bytes returnData)[]"),
        raw,
      ) as [Array<{ success: boolean; returnData: Hex; }>];

      const decoded: BatchResult[] = returnValues.map((r, i) => {
        const label = calls[i]?.label ?? `Call ${i}`;

        if (!r.success || r.returnData === "0x") {
          return { label, value: "call failed", success: false };
        }

        try {
          const [val] = decodeAbiParameters(parseAbiParameters("uint256"), r.returnData);

          return { label, value: `${formatEther(val as bigint)} ETH`, success: true };
        }
        catch {
          return { label, value: r.returnData, success: true };
        }
      });

      setPreview(decoded);
      setResponse(raw);
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell source="components/demos/multicall-demo.tsx">
      <p className="text-sm text-secondary">
        Multicall3:
        {" "}
        <Address address={MULTICALL3_ADDRESS} />
      </p>
      <p className="mt-1.5 text-sm text-secondary">
        Batching
        {" "}
        <strong>
          {calls.length}
          {" "}
          call
          {calls.length === 1 ? "" : "s"}
        </strong>
        {" "}
        into one
        {" "}
        <code>eth_call</code>
        {calls.map(c => (
          <span key={c.label}>
            {" "}
            -
            <code>{c.label}</code>
          </span>
        ))}
      </p>

      <WalletActionPanel
        inspector={
          requestCall
            ? {
                user: preview
                  ? (
                      <ul className="m-0 list-none p-0">
                        {preview.map(r => (
                          <li key={r.label} className="mt-1.5 flex items-baseline gap-3">
                            <span className="min-w-32 text-[13px] text-secondary">{r.label}</span>
                            <code className={r.success ? "" : "text-destructive"}>
                              {r.value}
                            </code>
                          </li>
                        ))}
                      </ul>
                    )
                  : (
                      <p className="text-sm text-secondary">Run the batch to see decoded balances here.</p>
                    ),
                request: { method: "eth_call", params: [requestCall, "latest"] },
              }
            : undefined
        }
        response={response}
        error={error}
        pending={pending}
        actions={[
          {
            label: pending ? "Fetching…" : "Run batch",
            onClick: runBatch,
            primary: true,
            disabled: calls.length === 0,
          },
        ]}
      />
    </DemoShell>
  );
};
