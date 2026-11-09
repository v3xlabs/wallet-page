"use client";

import { FiX } from "react-icons/fi";

import { useWallet } from "./WalletProvider";

export const WalletBadge = () => {
  const { session, disconnect } = useWallet();

  if (!session) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 pl-2 text-control">
      {session.icon && (
        <img
          src={session.icon}
          alt=""
          className="shrink-0 rounded-sm"
          width={16}
          height={16}
        />
      )}
      <span className="truncate font-medium text-heading" title={session.rdns}>
        {session.label}
      </span>
      <span className="font-mono text-xs whitespace-nowrap text-secondary" title={session.accounts[0]}>
        {`${session.accounts[0].slice(0, 6)}...${session.accounts[0].slice(-4)}`}
      </span>
      <button
        type="button"
        className="demo-icon-btn"
        onClick={() => disconnect()}
        aria-label="Disconnect wallet"
        title="Disconnect wallet"
      >
        <FiX aria-hidden className="size-4" />
      </button>
    </div>
  );
};
