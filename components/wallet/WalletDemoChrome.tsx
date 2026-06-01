"use client";

import { WalletBadge } from "./WalletBadge";
import { useWallet } from "./WalletProvider";

/** Top-right demo chrome: connected session badge or connect control. */
export function WalletDemoChrome() {
  const { session, openConnect, connecting } = useWallet();

  if (session) {
    return <WalletBadge />;
  }

  return (
    <button
      type="button"
      className="wallet-demo-badge wallet-demo-badge-connect"
      onClick={openConnect}
      disabled={connecting}
    >
      {connecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
