"use client";

import type { ReactNode } from "react";

import { WalletDemoChrome } from "./WalletDemoChrome";
import { useWallet } from "./WalletProvider";

type DemoFrameProperties = {
  children: ReactNode;
  /** Repo-relative path to the demo's source file, e.g. `components/demos/erc-20-demo.tsx`. */
  source?: string;
};

export const DemoFrame = ({ children, source }: DemoFrameProperties) => (
  <div className="demo-frame">
    <WalletDemoChrome source={source} />
    <div className="p-4">{children}</div>
  </div>
);

/** Prefer `useWallet().requireSession` -- alias for demo action handlers. */
export const useDemoFrame = () => {
  const { openConnect, requireSession } = useWallet();

  return { openConnect, requireSession };
};
