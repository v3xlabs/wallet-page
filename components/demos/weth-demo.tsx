"use client";

import { useMemo, useState } from "react";
import {
  type Address,
  decodeFunctionResult,
  encodeFunctionData,
  formatEther,
  type Hex,
  parseAbi,
  parseEther,
} from "viem";

import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const WETH_ABI = parseAbi([
  "function deposit() payable",
  "function withdraw(uint256 wad)",
  "function balanceOf(address) view returns (uint256)",
]);

const WETH_BY_CHAIN: Record<string, Address> = {
  "0x1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xaa36a7": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  "0x4268": "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
  "0x2105": "0x4200000000000000000000000000000000000006",
  "0xa": "0x4200000000000000000000000000000000000006",
  "0xa4b1": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

const DEFAULT_AMOUNT = "0.001";

export function WethDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [balance, setBalance] = useState<string>();
  const [balanceError, setBalanceError] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [pending, setPending] = useState(false);

  const wethAddress = session
    ? WETH_BY_CHAIN[session.chainId.toLowerCase() as Hex]
    : undefined;

  const parsedWei = useMemo(() => {
    try {
      return parseEther(amount || "0");
    }
    catch {
      return;
    }
  }, [amount]);

  const balanceCall = useMemo(() => {
    if (!wethAddress) return null;

    return {
      to: wethAddress,
      data: encodeFunctionData({
        abi: WETH_ABI,
        functionName: "balanceOf",
        args: [session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT],
      }),
    };
  }, [session, wethAddress]);

  const wrapTx = useMemo(() => {
    if (!wethAddress || !parsedWei) return null;

    return {
      from: session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT,
      to: wethAddress,
      value: `0x${parsedWei.toString(16)}` as Hex,
      data: encodeFunctionData({ abi: WETH_ABI, functionName: "deposit" }),
    };
  }, [session, wethAddress, parsedWei]);

  const unwrapTx = useMemo(() => {
    if (!wethAddress || !parsedWei) return null;

    return {
      from: session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT,
      to: wethAddress,
      value: "0x0" as Hex,
      data: encodeFunctionData({
        abi: WETH_ABI,
        functionName: "withdraw",
        args: [parsedWei],
      }),
    };
  }, [session, wethAddress, parsedWei]);

  const readBalance = async () => {
    if (!requireSession() || !wethAddress || !balanceCall) return;

    setPending(true);
    setBalanceError(undefined);
    setBalance(undefined);

    try {
      const raw = await rpc(session.provider, "eth_call", [balanceCall, "latest"]) as Hex;
      const [bal] = decodeFunctionResult({ abi: WETH_ABI, functionName: "balanceOf", data: raw }) as [bigint];

      setBalance(`${formatEther(bal)} WETH`);
    }
    catch (error) {
      setBalanceError(formatError(error));
    }
    finally {
      setPending(false);
    }
  };

  const wrap = async () => {
    if (!requireSession() || !wrapTx) return;

    setPending(true);
    setTxError(undefined);
    setTxHash(undefined);

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [wrapTx]);

      setTxHash(String(hash));
    }
    catch (error) {
      setTxError(formatError(error));
    }
    finally {
      setPending(false);
    }
  };

  const unwrap = async () => {
    if (!requireSession() || !unwrapTx) return;

    setPending(true);
    setTxError(undefined);
    setTxHash(undefined);

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [unwrapTx]);

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
    <DemoShell source="components/demos/weth-demo.tsx">
      {wethAddress
        ? (
            <p className="wallet-demo-muted">
              WETH on this chain:
              {" "}
              <code>{wethAddress}</code>
            </p>
          )
        : (
            <p className="wallet-demo-muted">
              {session
                ? (
                    <>
                      No known WETH address for chain
                      {" "}
                      <code>{session.chainId}</code>
                      {" "}
                      — switch to
                      mainnet, Sepolia, Base, Optimism, or Arbitrum.
                    </>
                  )
                : (
                    <>
                      WETH address depends on the active chain (mainnet, Sepolia, Holesky, Base,
                      Optimism, Arbitrum One).
                    </>
                  )}
            </p>
          )}

      <WalletActionPanel
        inspector={
          balanceCall
            ? { request: { method: "eth_call", params: [balanceCall, "latest"] } }
            : undefined
        }
        response={balance}
        error={balanceError}
        actions={[{
          label: "Read WETH balance",
          onClick: readBalance,
          primary: true,
          disabled: !wethAddress,
        }]}
        pending={pending}
      />

      <label className="wallet-demo-field">
        <span className="wallet-demo-muted">Amount (ETH / WETH)</span>
        <input
          type="text"
          className="wallet-demo-input"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </label>

      <WalletActionPanel
        inspector={wrapTx
          ? {
              user: (
                <TransactionPreview
                  from={wrapTx.from}
                  to={wrapTx.to}
                  valueLabel={`${amount} ETH`}
                  data={wrapTx.data}
                />
              ),
              request: { method: "eth_sendTransaction", params: [wrapTx] },
            }
          : undefined}
        response={txHash}
        error={txError}
        pending={pending}
        actions={[{
          label: "Wrap ETH → WETH",
          onClick: wrap,
          primary: true,
          disabled: !wethAddress || !parsedWei,
        }]}
      />

      <WalletActionPanel
        inspector={unwrapTx
          ? {
              user: (
                <TransactionPreview
                  from={unwrapTx.from}
                  to={unwrapTx.to}
                  valueLabel={`${amount} WETH`}
                  data={unwrapTx.data}
                />
              ),
              request: { method: "eth_sendTransaction", params: [unwrapTx] },
            }
          : undefined}
        response={txHash}
        error={txError}
        pending={pending}
        actions={[{
          label: "Unwrap WETH → ETH",
          onClick: unwrap,
          disabled: !wethAddress || !parsedWei,
        }]}
      />
    </DemoShell>
  );
}
