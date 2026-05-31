"use client";

import { useMemo, useState } from "react";
import {
  decodeFunctionResult,
  encodeFunctionData,
  formatEther,
  parseAbi,
  parseEther,
  type Address,
  type Hex,
} from "viem";

import { rpc } from "../../lib/ethereum";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const WETH_ABI = parseAbi([
  "function deposit() payable",
  "function withdraw(uint256 wad)",
  "function balanceOf(address) view returns (uint256)",
]);

const WETH_BY_CHAIN: Record<string, Address> = {
  "0x1":       "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Mainnet
  "0xaa36a7":  "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // Sepolia
  "0x4268":    "0x94373a4919B3240D86eA41593D5eBa789FEF3848", // Holesky
  "0x2105":    "0x4200000000000000000000000000000000000006", // Base
  "0xa":       "0x4200000000000000000000000000000000000006", // Optimism
  "0xa4b1":    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Arbitrum One
};

const DEFAULT_AMOUNT = "0.001";

export function WethDemo() {
  const { session } = useWallet();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [balance, setBalance] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const wethAddress = session
    ? WETH_BY_CHAIN[session.chainId.toLowerCase() as Hex]
    : undefined;

  const parsedWei = useMemo(() => {
    try { return parseEther(amount || "0"); }
    catch { return undefined; }
  }, [amount]);

  const wrapTx = useMemo(() => {
    if (!session || !wethAddress || !parsedWei) return null;
    return {
      from: session.accounts[0],
      to: wethAddress,
      value: `0x${parsedWei.toString(16)}` as Hex,
      data: encodeFunctionData({ abi: WETH_ABI, functionName: "deposit" }),
    };
  }, [session, wethAddress, parsedWei]);

  const unwrapTx = useMemo(() => {
    if (!session || !wethAddress || !parsedWei) return null;
    return {
      from: session.accounts[0],
      to: wethAddress,
      value: "0x0" as Hex,
      data: encodeFunctionData({
        abi: WETH_ABI,
        functionName: "withdraw",
        args: [parsedWei],
      }),
    };
  }, [session, wethAddress, parsedWei]);

  const exec = async (fn: () => Promise<void>) => {
    setPending(true);
    setError(undefined);
    setTxHash(undefined);
    setBalance(undefined);
    try { await fn(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setPending(false); }
  };

  const readBalance = () => exec(async () => {
    if (!session || !wethAddress) throw new Error("No WETH address for this chain.");
    const raw = await rpc(session.provider, "eth_call", [{
      to: wethAddress,
      data: encodeFunctionData({
        abi: WETH_ABI,
        functionName: "balanceOf",
        args: [session.accounts[0]],
      }),
    }, "latest"]) as Hex;
    const [bal] = decodeFunctionResult({ abi: WETH_ABI, functionName: "balanceOf", data: raw }) as [bigint];
    setBalance(`${formatEther(bal)} WETH`);
  });

  const wrap = () => exec(async () => {
    if (!wrapTx) throw new Error("Invalid amount or chain.");
    const hash = await rpc(session!.provider, "eth_sendTransaction", [wrapTx]);
    setTxHash(String(hash));
  });

  const unwrap = () => exec(async () => {
    if (!unwrapTx) throw new Error("Invalid amount or chain.");
    const hash = await rpc(session!.provider, "eth_sendTransaction", [unwrapTx]);
    setTxHash(String(hash));
  });

  return (
    <DemoShell>
      {wethAddress ? (
        <p className="wallet-demo-muted">
          WETH on this chain:{" "}
          <code>{wethAddress}</code>
        </p>
      ) : session ? (
        <p className="wallet-demo-muted">
          No known WETH address for chain <code>{session.chainId}</code> — switch to
          mainnet, Sepolia, Base, Optimism, or Arbitrum.
        </p>
      ) : null}

      <WalletActionPanel
        actions={[{
          label: "Read WETH balance",
          onClick: readBalance,
          primary: true,
          disabled: !session || !wethAddress,
        }]}
        pending={pending}
      >
        <ResultBlock label="Balance" value={balance} error={!txHash ? error : undefined} />
      </WalletActionPanel>

      <label className="wallet-demo-field">
        <span className="wallet-demo-muted">Amount (ETH / WETH)</span>
        <input
          type="text"
          className="wallet-demo-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <WalletActionPanel
        inspector={wrapTx ? {
          user: (
            <TransactionPreview
              from={wrapTx.from}
              to={wrapTx.to}
              valueLabel={`${amount} ETH`}
              data={wrapTx.data}
            />
          ),
          rpc: { method: "eth_sendTransaction", params: [wrapTx] },
        } : undefined}
        pending={pending}
        actions={[{
          label: "Wrap ETH → WETH",
          onClick: wrap,
          primary: true,
          disabled: !session || !wethAddress || !parsedWei,
        }]}
      >
        <ResultBlock label="Transaction" value={txHash} error={txHash ? undefined : error} />
      </WalletActionPanel>

      <WalletActionPanel
        inspector={unwrapTx ? {
          user: (
            <TransactionPreview
              from={unwrapTx.from}
              to={unwrapTx.to}
              valueLabel={`${amount} WETH`}
              data={unwrapTx.data}
            />
          ),
          rpc: { method: "eth_sendTransaction", params: [unwrapTx] },
        } : undefined}
        pending={pending}
        actions={[{
          label: "Unwrap WETH → ETH",
          onClick: unwrap,
          disabled: !session || !wethAddress || !parsedWei,
        }]}
      >
        <ResultBlock label="Transaction" value={txHash} error={txHash ? undefined : error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
