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
      ? "my-4 overflow-hidden rounded-md border border-primary bg-code-block"
      : (variant === "inline"
          ? "my-4 overflow-hidden rounded-lg border border-primary"
          : "my-6 overflow-hidden rounded-lg border border-primary");

  return (
    <div className={rootClass}>
      <div
        className={
          variant === "mini"
            ? "relative px-4 pt-9 pb-10"
            : "relative bg-code-block px-5 pt-10 pb-4"
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
