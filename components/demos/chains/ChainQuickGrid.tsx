"use client";

import { useState } from "react";
import type { Hex } from "viem";

import { DEMO_CHAINS } from "../../../lib/chains";
import { formatError, rpc } from "../../../lib/ethereum";
import { WalletBadge } from "../../wallet/WalletBadge";
import { useWallet } from "../../wallet/WalletProvider";

/** Network grid — switch / add shortcuts (separate from the RPC mini demos below). */
export function ChainQuickGrid() {
  const { session, refreshSession } = useWallet();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (!session) {
    return (
      <div className="wallet-demo wallet-demo-chain-shell">
        <div className="wallet-demo-panel wallet-demo-panel-gate">
          <p className="wallet-demo-muted">
            Connect a wallet on the <a href="/connect">Connect</a> page to use the
            network grid.
          </p>
        </div>
      </div>
    );
  }

  const refreshChainId = async () => {
    try {
      await refreshSession();
    }
    catch (err) {
      setError(formatError(err));
    }
  };

  const switchChain = async (targetChainId: Hex) => {
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
          ? `${message}\n\nTry Add chain on the same network, or use the wallet_addEthereumChain demo below.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  const addChain = async (targetChainId: Hex) => {
    const meta = DEMO_CHAINS.find((c) => c.chainId === targetChainId);
    if (!meta) return;
    setPending(true);
    setError(undefined);
    try {
      await rpc(session.provider, "wallet_addEthereumChain", [
        {
          chainId: targetChainId,
          chainName: meta.name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [meta.rpcUrl],
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

  const active = session.chainId.toLowerCase();

  return (
    <div className="wallet-demo wallet-demo-chain-shell">
      <div className="wallet-demo-panel wallet-demo-panel-connected">
        <WalletBadge />
        <p className="wallet-demo-muted">
          Active chain: <code>{session.chainId}</code>
        </p>
        <div className="wallet-demo-chain-grid">
          {DEMO_CHAINS.map((chain) => {
            const isActive = chain.chainId.toLowerCase() === active;
            return (
              <div
                key={chain.chainId}
                className={`wallet-demo-chain-card${isActive ? " wallet-demo-chain-card-active" : ""}`}
              >
                <span>{chain.name}</span>
                <code>{chain.chainId}</code>
                <div className="wallet-demo-actions">
                  <button
                    type="button"
                    className="wallet-demo-btn wallet-demo-btn-primary"
                    disabled={pending || isActive}
                    onClick={() => void switchChain(chain.chainId)}
                  >
                    {isActive ? "Active" : "Switch"}
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
            );
          })}
        </div>
        {error && (
          <p className="wallet-demo-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
