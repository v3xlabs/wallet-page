"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

const CHAINS: { name: string; chainId: Hex }[] = [
  { name: "Ethereum Mainnet", chainId: "0x1" },
  { name: "Sepolia", chainId: "0xaa36a7" },
  { name: "Holesky", chainId: "0x4268" },
  { name: "Base", chainId: "0x2105" },
  { name: "Optimism", chainId: "0xa" },
];

export function SwitchChainDemo() {
  const { session, refreshSession } = useWallet();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const refreshChainId = async () => {
    if (!session) return;
    try {
      await refreshSession();
    }
    catch (err) {
      setError(formatError(err));
    }
  };

  const switchChain = async (targetChainId: Hex) => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    try {
      await rpc(session.provider, "wallet_switchEthereumChain", [
        { chainId: targetChainId },
      ]);
      await refreshChainId();
    }
    catch (err) {
      const message = formatError(err);
      setError(
        message.includes("4902") || message.includes("Unrecognized")
          ? `${message}\n\nTry “Add chain” for the same network.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  const addChain = async (targetChainId: Hex) => {
    if (!session) return;
    const meta = CHAINS.find((c) => c.chainId === targetChainId);
    if (!meta) return;
    setPending(true);
    setError(undefined);
    try {
      await rpc(session.provider, "wallet_addEthereumChain", [
        {
          chainId: targetChainId,
          chainName: meta.name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://ethereum.publicnode.com"],
        },
      ]);
      await refreshChainId();
    }
    catch (err) {
      setError(formatError(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>wallet_switchEthereumChain</h3>
        <p className="wallet-demo-muted">
          EIP-3326 — change active chain. Error 4902 usually means add the network
          first.
        </p>
        <div className="wallet-demo-chain-grid">
          {CHAINS.map((chain) => (
            <div key={chain.chainId} className="wallet-demo-chain-card">
              <span>{chain.name}</span>
              <code>{chain.chainId}</code>
              <div className="wallet-demo-actions">
                <button
                  type="button"
                  className="wallet-demo-btn wallet-demo-btn-primary"
                  disabled={pending}
                  onClick={() => void switchChain(chain.chainId)}
                >
                  Switch
                </button>
                <button
                  type="button"
                  className="wallet-demo-btn"
                  disabled={pending}
                  onClick={() => void addChain(chain.chainId)}
                >
                  Add chain
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="wallet-demo-btn"
          onClick={() => void refreshChainId()}
        >
          Refresh eth_chainId
        </button>
        <ResultBlock
          label="Active chain"
          value={session?.chainId ? `chainId: ${session.chainId}` : undefined}
          pending={pending}
          error={error}
        />
      </section>
    </DemoShell>
  );
}
