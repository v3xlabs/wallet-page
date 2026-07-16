"use client";

import { useMemo, useState } from "react";
import {
  type Address,
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseAbi,
  parseUnits,
} from "viem";

import { DEMO_PLACEHOLDER_ACCOUNT, formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { TransactionPreview } from "../wallet/preview/TransactionPreview";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const erc20Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
]);

const DEFAULT_TOKEN
  = "0x779877A7B0D9E8603169DdbD7836e478b462Ed970" as Address;

const TRANSFER_AMOUNT = "0.0001";

export const Erc20Demo = () => {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [balance, setBalance] = useState<string>();
  const [balanceError, setBalanceError] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [pending, setPending] = useState(false);

  const tokenAddress = isAddress(token.trim())
    ? (token.trim() as Address)
    : undefined;

  const balanceCall = useMemo(() => {
    if (!tokenAddress) return null;

    return {
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [session?.accounts[0] ?? "0x0000000000000000000000000000000000000000"],
      }),
    };
  }, [session, tokenAddress]);

  const transferTx = useMemo(() => {
    if (!tokenAddress) return null;

    return {
      from: session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          session?.accounts[0] ?? DEMO_PLACEHOLDER_ACCOUNT,
          parseUnits(TRANSFER_AMOUNT, 18),
        ],
      }),
      value: "0x0" as const,
    };
  }, [session, tokenAddress]);

  const readBalance = async () => {
    if (!requireSession() || !balanceCall || !tokenAddress) {
      setBalanceError("Enter a valid ERC-20 contract address.");

      return;
    }

    setPending(true);
    setBalanceError(undefined);
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
    catch (error) {
      setBalanceError(formatError(error));
    }
    finally {
      setPending(false);
    }
  };

  const sendTransfer = async () => {
    if (!requireSession() || !transferTx) return;

    setPending(true);
    setTxError(undefined);
    setTxHash(undefined);

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [
        {
          from: session.accounts[0],
          to: tokenAddress!,
          data: transferTx.data,
          value: "0x0" as const,
        },
      ]);

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
    <DemoShell source="components/demos/erc-20-demo.tsx">
      <label className="my-3 flex flex-col gap-1.5">
        <span className="text-sm text-secondary">Token contract</span>
        <input
          type="text"
          className="demo-input font-mono"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
      </label>

      <WalletActionPanel
        inspector={
          balanceCall
            ? {
                user: (
                  <p>
                    Read
                    <code>balanceOf</code>
                    {" "}
                    for the active account.
                  </p>
                ),
                request: { method: "eth_call", params: [balanceCall, "latest"] },
              }
            : undefined
        }
        response={balance}
        error={balanceError}
        actions={[
          {
            label: "Read balance",
            onClick: readBalance,
            primary: true,
            disabled: !tokenAddress,
          },
        ]}
        pending={pending}
      />

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
                request: { method: "eth_sendTransaction", params: [transferTx] },
              }
            : undefined
        }
        response={txHash}
        error={txError}
        pending={pending}
        actions={[
          {
            label: "Transfer to self",
            onClick: sendTransfer,
            primary: true,
            disabled: !tokenAddress,
          },
        ]}
      />
    </DemoShell>
  );
};
