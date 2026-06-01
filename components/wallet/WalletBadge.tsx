"use client";

import { useWallet } from "./WalletProvider";

function trimAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletBadge() {
  const { session, disconnect } = useWallet();

  if (!session) return null;

  return (
    <div className="wallet-demo-badge">
      {session.icon && (
        <img
          src={session.icon}
          alt=""
          className="wallet-demo-badge-icon"
          width={18}
          height={18}
        />
      )}
      <span className="wallet-demo-badge-name" title={session.rdns}>
        {session.label}
      </span>
      <span className="wallet-demo-badge-addr" title={session.accounts[0]}>
        {trimAddress(session.accounts[0])}
      </span>
      <button
        type="button"
        className="wallet-demo-badge-disconnect"
        onClick={() => disconnect()}
        aria-label="Disconnect wallet"
      >
        ×
      </button>
    </div>
  );
}
