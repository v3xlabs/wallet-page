"use client";

import classNames from "classnames";
import { useState } from "react";
import type { Hex } from "viem";

import { DEMO_CHAINS } from "../../../lib/chains";
import { formatError, rpc } from "../../../lib/ethereum";
import { useDemoFrame } from "../../wallet/DemoFrame";
import { DemoShell } from "../../wallet/DemoShell";
import { useWallet } from "../../wallet/WalletProvider";

/** Network grid -- switch / add shortcuts (separate from the RPC mini demos below). */
export const ChainQuickGrid = () => {
  const { session, refreshSession } = useWallet();
  const { requireSession } = useDemoFrame();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const refreshChainId = async () => {
    try {
      await refreshSession();
    }
    catch (error_) {
      setError(formatError(error_));
    }
  };

  const switchChain = async (targetChainId: Hex) => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);

    try {
      await rpc(session.provider, "wallet_switchEthereumChain", [
        { chainId: targetChainId },
      ]);
      await refreshChainId();
    }
    catch (error_) {
      const message = formatError(error_);

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
    if (!requireSession()) return;

    const meta = DEMO_CHAINS.find(c => c.chainId === targetChainId);

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
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  const active = session?.chainId.toLowerCase();

  return (
    <DemoShell source="components/demos/chains/chain-quick-grid.tsx">
      <div className="flex flex-col gap-4">
        {session && (
          <p className="m-0 text-control text-secondary">
            Active chain:
            {" "}
            <span className="font-mono text-control text-primary">{session.chainId}</span>
          </p>
        )}
        <div className="flex flex-col gap-4">
          {DEMO_CHAINS.map((chain) => {
            const isActive = active && chain.chainId.toLowerCase() === active;

            return (
              <div
                key={chain.chainId}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className={classNames("text-sm", isActive ? "font-semibold" : "font-medium")}>{chain.name}</span>
                  <span className="font-mono text-control text-secondary">{chain.chainId}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="demo-btn"
                    disabled={pending || isActive}
                    onClick={() => void switchChain(chain.chainId)}
                  >
                    {isActive ? "Active" : "Switch"}
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
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
          <p className="m-0 text-sm whitespace-pre-wrap text-destructive wrap-break-word" role="alert">
            {error}
          </p>
        )}
      </div>
    </DemoShell>
  );
};
