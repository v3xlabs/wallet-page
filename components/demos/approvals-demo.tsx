"use client";

import { useMemo, useState } from "react";
import {
  type Address,
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
  type Hex,
  isAddress,
  parseAbi,
} from "viem";

import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const ERC20_ABI = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

const KNOWN_SPENDERS: { label: string; address: Address; }[] = [
  { label: "Uniswap v3 Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564" },
  { label: "Uniswap Universal", address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD" },
  { label: "OpenSea Seaport 1.5", address: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC" },
  { label: "1inch v5", address: "0x1111111254EEB25477B68fb85Ed929f73A960582" },
];

export function ApprovalsDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();

  const [token, setToken] = useState("");
  const [spender, setSpender] = useState("");
  const [allowance, setAllowance] = useState<string>();
  const [allowanceError, setAllowanceError] = useState<string>();
  const [rawAllowance, setRawAllowance] = useState<bigint>();
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tokenAddr = isAddress(token.trim()) ? (token.trim() as Address) : undefined;
  const spenderAddr = isAddress(spender.trim()) ? (spender.trim() as Address) : undefined;

  const allowanceCall = useMemo(() => {
    if (!tokenAddr || !spenderAddr) return null;

    return {
      to: tokenAddr,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT, spenderAddr],
      }),
    };
  }, [session, tokenAddr, spenderAddr]);

  const revokeTx = useMemo(() => {
    if (!session || !tokenAddr || !spenderAddr) return null;

    return {
      from: session.accounts[0],
      to: tokenAddr,
      value: "0x0" as Hex,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spenderAddr, 0n],
      }),
    };
  }, [session, tokenAddr, spenderAddr]);

  const readAllowance = async () => {
    if (!requireSession()) return;

    if (!tokenAddr) {
      setAllowanceError("Enter a valid token address.");

      return;
    }

    if (!spenderAddr) {
      setAllowanceError("Enter a valid spender address.");

      return;
    }

    setPending(true);
    setAllowanceError(undefined);
    setAllowance(undefined);
    setTxHash(undefined);

    try {
      const [decimalsRaw, symbolRaw, allowanceRaw] = await Promise.all([
        rpc(session.provider, "eth_call", [{ to: tokenAddr, data: encodeFunctionData({ abi: ERC20_ABI, functionName: "decimals" }) }, "latest"]).catch(() => null),
        rpc(session.provider, "eth_call", [{ to: tokenAddr, data: encodeFunctionData({ abi: ERC20_ABI, functionName: "symbol" }) }, "latest"]).catch(() => null),
        rpc(session.provider, "eth_call", [allowanceCall!, "latest"]),
      ]);

      const [val] = decodeFunctionResult({ abi: ERC20_ABI, functionName: "allowance", data: allowanceRaw as Hex }) as [bigint];

      setRawAllowance(val);

      const decimals = decimalsRaw
        ? Number((decodeFunctionResult({ abi: ERC20_ABI, functionName: "decimals", data: decimalsRaw as Hex }) as [number])[0])
        : 18;
      const symbol = symbolRaw
        ? String((decodeFunctionResult({ abi: ERC20_ABI, functionName: "symbol", data: symbolRaw as Hex }) as [string])[0])
        : "tokens";

      if (val === 0n) {
        setAllowance(`0 ${symbol} — no allowance set`);
      }
      else if (val >= 2n ** 256n - 1n / 2n) {
        setAllowance(`Unlimited ${symbol}`);
      }
      else {
        setAllowance(`${formatUnits(val, decimals)} ${symbol}`);
      }
    }
    catch (error) {
      setAllowanceError(formatError(error));
    }
    finally {
      setPending(false);
    }
  };

  const revoke = async () => {
    if (!requireSession() || !revokeTx) return;

    setPending(true);
    setTxError(undefined);
    setTxHash(undefined);

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [revokeTx]);

      setTxHash(String(hash));
    }
    catch (error) {
      setTxError(formatError(error));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell source="components/demos/approvals-demo.tsx">
      <label className="my-3 flex flex-col gap-1.5">
        <span className="text-sm text-secondary">Token contract</span>
        <input
          type="text"
          className="demo-input font-mono"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="0x…"
        />
      </label>

      <label className="my-3 flex flex-col gap-1.5">
        <span className="text-sm text-secondary">Spender contract</span>
        <input
          type="text"
          className="demo-input font-mono"
          value={spender}
          onChange={e => setSpender(e.target.value)}
          placeholder="0x…"
        />
        <div className="mt-1.5 mb-3 flex flex-wrap gap-2">
          {KNOWN_SPENDERS.map(s => (
            <button
              key={s.address}
              type="button"
              className="demo-btn px-2.5 py-1 text-[13px]"
              onClick={() => setSpender(s.address)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </label>

      <WalletActionPanel
        inspector={
          allowanceCall
            ? {
                request: { method: "eth_call", params: [allowanceCall, "latest"] },
              }
            : undefined
        }
        response={allowance}
        error={allowanceError}
        actions={[{
          label: "Read allowance",
          onClick: readAllowance,
          primary: true,
          disabled: !tokenAddr || !spenderAddr,
        }]}
        pending={pending}
      />

      <WalletActionPanel
        inspector={revokeTx
          ? {
              user: (
                <TransactionPreview
                  from={revokeTx.from}
                  to={revokeTx.to}
                  valueLabel="Revoke — set allowance to 0"
                  data={revokeTx.data}
                />
              ),
              request: { method: "eth_sendTransaction", params: [revokeTx] },
            }
          : undefined}
        response={txHash}
        error={txError}
        pending={pending}
        actions={[{
          label: rawAllowance === 0n ? "Nothing to revoke" : "Revoke approval",
          onClick: revoke,
          disabled: !revokeTx || rawAllowance === 0n,
        }]}
      />
    </DemoShell>
  );
}
