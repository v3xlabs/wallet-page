"use client";

import { useWallet } from "./WalletProvider";

const trimAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const WalletBadge = () => {
  const { session, disconnect } = useWallet();

  if (!session) return null;

  return (
    <div className="flex max-w-[min(100%,22rem)] items-center gap-1.5 rounded-full border border-primary bg-surfaceMuted py-1 pr-1.5 pl-2 text-xs">
      {session.icon && (
        <img
          src={session.icon}
          alt=""
          className="shrink-0 rounded-sm"
          width={18}
          height={18}
        />
      )}
      <span className="truncate font-semibold" title={session.rdns}>
        {session.label}
      </span>
      <span className="font-mono whitespace-nowrap text-secondary" title={session.accounts[0]}>
        {trimAddress(session.accounts[0])}
      </span>
      <button
        type="button"
        className="ml-0.5 cursor-pointer px-1 text-[1.1rem] leading-none text-secondary hover:text-primary"
        onClick={() => disconnect()}
        aria-label="Disconnect wallet"
      >
        ×
      </button>
    </div>
  );
};
