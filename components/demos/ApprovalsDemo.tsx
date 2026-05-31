"use client";

import { useMemo, useState } from "react";
import {
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseAbi,
  type Address,
  type Hex,
} from "viem";

import { rpc } from "../../lib/ethereum";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const ERC20_ABI = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

// Well-known spenders for quick selection
const KNOWN_SPENDERS: { label: string; address: Address }[] = [
  { label: "Uniswap v3 Router",   address: "0xE592427A0AEce92De3Edee1F18E0157C05861564" },
  { label: "Uniswap Universal",   address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD" },
  { label: "OpenSea Seaport 1.5", address: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC" },
  { label: "1inch v5",            address: "0x1111111254EEB25477B68fb85Ed929f73A960582" },
];

export function ApprovalsDemo() {
  const { session } = useWallet();

  const [token, setToken] = useState("");
  const [spender, setSpender] = useState("");
  const [allowance, setAllowance] = useState<string>();
  const [rawAllowance, setRawAllowance] = useState<bigint>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tokenAddr = isAddress(token.trim()) ? (token.trim() as Address) : undefined;
  const spenderAddr = isAddress(spender.trim()) ? (spender.trim() as Address) : undefined;

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

  const exec = async (fn: () => Promise<void>) => {
    setPending(true);
    setError(undefined);
    try { await fn(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setPending(false); }
  };

  const readAllowance = () => exec(async () => {
    if (!session) throw new Error("Connect a wallet first.");
    if (!tokenAddr) throw new Error("Enter a valid token address.");
    if (!spenderAddr) throw new Error("Enter a valid spender address.");

    setAllowance(undefined);
    setTxHash(undefined);

    const [decimalsRaw, symbolRaw, allowanceRaw] = await Promise.all([
      rpc(session.provider, "eth_call", [{ to: tokenAddr, data: encodeFunctionData({ abi: ERC20_ABI, functionName: "decimals" }) }, "latest"]).catch(() => null),
      rpc(session.provider, "eth_call", [{ to: tokenAddr, data: encodeFunctionData({ abi: ERC20_ABI, functionName: "symbol" }) }, "latest"]).catch(() => null),
      rpc(session.provider, "eth_call", [{
        to: tokenAddr,
        data: encodeFunctionData({ abi: ERC20_ABI, functionName: "allowance", args: [session.accounts[0], spenderAddr] }),
      }, "latest"]),
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
    } else if (val >= 2n ** 256n - 1n / 2n) {
      setAllowance(`Unlimited ${symbol}`);
    } else {
      setAllowance(`${formatUnits(val, decimals)} ${symbol}`);
    }
  });

  const revoke = () => exec(async () => {
    if (!revokeTx) throw new Error("Fill in token and spender addresses first.");
    setTxHash(undefined);
    setAllowance(undefined);
    const hash = await rpc(session!.provider, "eth_sendTransaction", [revokeTx]);
    setTxHash(String(hash));
  });

  return (
    <DemoShell>
      <label className="wallet-demo-field">
        <span className="wallet-demo-muted">Token contract</span>
        <input
          type="text"
          className="wallet-demo-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="0x…"
        />
      </label>

      <label className="wallet-demo-field">
        <span className="wallet-demo-muted">Spender contract</span>
        <input
          type="text"
          className="wallet-demo-input"
          value={spender}
          onChange={(e) => setSpender(e.target.value)}
          placeholder="0x…"
        />
        <div className="wallet-demo-actions" style={{ marginTop: "0.35rem" }}>
          {KNOWN_SPENDERS.map((s) => (
            <button
              key={s.address}
              type="button"
              className="wallet-demo-btn"
              style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem" }}
              onClick={() => setSpender(s.address)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </label>

      <WalletActionPanel
        actions={[{
          label: "Read allowance",
          onClick: readAllowance,
          primary: true,
          disabled: !session || !tokenAddr || !spenderAddr,
        }]}
        pending={pending}
      >
        <ResultBlock label="Allowance" value={allowance} error={!txHash ? error : undefined} />
      </WalletActionPanel>

      <WalletActionPanel
        inspector={revokeTx ? {
          user: (
            <TransactionPreview
              from={revokeTx.from}
              to={revokeTx.to}
              valueLabel="Revoke — set allowance to 0"
              data={revokeTx.data}
            />
          ),
          rpc: { method: "eth_sendTransaction", params: [revokeTx] },
        } : undefined}
        pending={pending}
        actions={[{
          label: rawAllowance === 0n ? "Nothing to revoke" : "Revoke approval",
          onClick: revoke,
          disabled: !session || !revokeTx || rawAllowance === 0n,
        }]}
      >
        <ResultBlock label="Transaction" value={txHash} error={txHash ? undefined : error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
