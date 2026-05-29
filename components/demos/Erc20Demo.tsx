"use client";

import { useState } from "react";
import {
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseAbi,
  parseUnits,
  type Address,
} from "viem";

import { rpc } from "../../lib/ethereum";
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

  const readBalance = async () => {
    if (!session || !tokenAddress) {
      setError("Enter a valid ERC-20 contract address.");
      return;
    }
    setPending(true);
    setError(undefined);
    setBalance(undefined);
    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [session.accounts[0]],
      });
      const raw = await rpc(session.provider, "eth_call", [
        { to: tokenAddress, data },
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
    if (!session || !tokenAddress) return;
    setPending(true);
    setError(undefined);
    setTxHash(undefined);
    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [session.accounts[0], parseUnits("0.0001", 18)],
      });
      const hash = await rpc(session.provider, "eth_sendTransaction", [
        { from: session.accounts[0], to: tokenAddress, data, value: "0x0" },
      ]);
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
      <section className="wallet-demo-section">
        <h3>ERC-20</h3>
        <p className="wallet-demo-muted">
          <code>eth_call</code> for <code>balanceOf</code> and{" "}
          <code>transfer</code> to self (use a token you hold on this chain).
        </p>
        <label className="wallet-demo-field">
          <span className="wallet-demo-muted">Token contract</span>
          <input
            type="text"
            className="wallet-demo-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <div className="wallet-demo-actions">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            disabled={pending}
            onClick={() => void readBalance()}
          >
            balanceOf
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void sendTransfer()}
          >
            transfer to self
          </button>
        </div>
        <ResultBlock label="Balance" value={balance} error={error} pending={pending} />
        <ResultBlock label="Transaction" value={txHash} />
      </section>
    </DemoShell>
  );
}
