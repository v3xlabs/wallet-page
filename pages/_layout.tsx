"use client";

import type { ReactNode } from "react";

import { WalletProvider } from "../components/wallet/WalletProvider";

export default function Layout({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
