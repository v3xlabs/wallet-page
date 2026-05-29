"use client";

import { useMemo, useState } from "react";
import {
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseAbi,
  parseUnits,
  type Address,
} from "viem";

import { rpc } from "../../lib/ethereum";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const erc20Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
]);

const DEFAULT_TOKEN =
  "0x779877A7B0D9E8603169DdbD7836e478b462Ed970" as Address;

const TRANSFER_AMOUNT = "0.0001";

export function Erc20Demo() {
  const { session } = useWallet();
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [balance, setBalance] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tokenAddress = isAddress(token.trim())
    ? (token.trim() as Address)
    : undefined;

  const balanceCall = useMemo(() => {
    if (!session || !tokenAddress) return null;
    return {
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [session.accounts[0]],
      }),
    };
  }, [session, tokenAddress]);

  const transferTx = useMemo(() => {
    if (!session || !tokenAddress) return null;
    return {
      from: session.accounts[0],
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [session.accounts[0], parseUnits(TRANSFER_AMOUNT, 18)],
      }),
      value: "0x0" as const,
    };
  }, [session, tokenAddress]);

  const readBalance = async () => {
    if (!session || !balanceCall) {
      setError("Enter a valid ERC-20 contract address.");
      return;
    }
    setPending(true);
    setError(undefined);
    setBalance(undefined);
    try {
      const raw = await rpc(session.provider, "eth_call", [
        balanceCall,
        "latest",
      ]);
      const decimalsRaw = await rpc(session.provider, "eth_call", [
        {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "decimals",
          }),
        },
        "latest",
      ]);
      const dec = Number(BigInt(String(decimalsRaw)));
      setBalance(formatUnits(BigInt(String(raw)), dec));
    }
    catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  const sendTransfer = async () => {
    if (!session || !transferTx) return;
    setPending(true);
    setError(undefined);
    setTxHash(undefined);
    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [transferTx]);
      setTxHash(String(hash));
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
      <label className="wallet-demo-field">
        <span className="wallet-demo-muted">Token contract</span>
        <input
          type="text"
          className="wallet-demo-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </label>

      <WalletActionPanel
        inspector={
          balanceCall
            ? {
                user: <p>Read <code>balanceOf</code> for your connected account.</p>,
                rpc: { method: "eth_call", params: [balanceCall, "latest"] },
              }
            : undefined
        }
        actions={[
          {
            label: "Read balance",
            onClick: readBalance,
            primary: true,
            disabled: !session || !tokenAddress,
          },
        ]}
        pending={pending}
      >
        <ResultBlock label="Balance" value={balance} error={error} />
      </WalletActionPanel>

      <WalletActionPanel
        inspector={
          transferTx
            ? {
                user: (
                  <TransactionPreview
                    from={transferTx.from}
                    to={transferTx.to}
                    valueLabel={`${TRANSFER_AMOUNT} tokens`}
                    data={transferTx.data}
                  />
                ),
                rpc: { method: "eth_sendTransaction", params: [transferTx] },
              }
            : undefined
        }
        pending={pending}
        actions={[
          {
            label: "Transfer to self",
            onClick: sendTransfer,
            primary: true,
            disabled: !session || !tokenAddress,
          },
        ]}
      >
        <ResultBlock label="Transaction" value={txHash} />
      </WalletActionPanel>
    </DemoShell>
  );
}
