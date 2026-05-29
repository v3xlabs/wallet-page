"use client";

import type { ReactNode } from "react";

import { WalletBadge } from "./WalletBadge";
import { useWallet } from "./WalletProvider";

/** Inline demo panel — use with PageDemoChrome on the same MDX page. */
export function DemoBlock({ children }: { children: ReactNode }) {
  const { session } = useWallet();
  if (!session) return null;

  return (
    <div className="wallet-demo wallet-demo-inline">
      <div className="wallet-demo-panel wallet-demo-panel-connected">
        <WalletBadge />
        {children}
      </div>
    </div>
  );
}
