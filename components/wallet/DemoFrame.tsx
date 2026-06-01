"use client";

import type { ReactNode } from "react";

import { WalletDemoChrome } from "./WalletDemoChrome";
import { useWallet } from "./WalletProvider";

type DemoFrameProps = {
  children: ReactNode;
  /** `inline` — several demos on one MDX page; `mini` — compact RPC block (chains). */
  variant?: "panel" | "inline" | "mini";
  /** Repo-relative path to the demo's source file, e.g. `components/demos/erc-20-demo.tsx`. */
  source?: string;
};

export function DemoFrame({ children, variant = "panel", source }: DemoFrameProps) {
  const rootClass
    = variant === "mini"
      ? "wallet-mini-demo"
      : (variant === "inline"
          ? "wallet-demo wallet-demo-inline"
          : "wallet-demo");

  return (
    <div className={rootClass}>
      <div
        className={
          variant === "mini"
            ? "wallet-mini-demo-body"
            : "wallet-demo-panel wallet-demo-panel-open"
        }
      >
        <WalletDemoChrome source={source} />
        {children}
      </div>
    </div>
  );
}

/** Prefer `useWallet().requireSession` — alias for demo action handlers. */
export function useDemoFrame() {
  const { openConnect, requireSession } = useWallet();

  return { openConnect, requireSession };
}
