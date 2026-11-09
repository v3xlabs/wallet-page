"use client";

import classNames from "classnames";
import { useState } from "react";

import { AddressAvatar } from "../../design/ui";

const MOCK_ACCOUNTS = [
  { address: "0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE", label: "Account 1", balance: "1.2847" },
  { address: "0x742d35Cc6634C0532925a3b8D4C9e6A6b5a96B1f", label: "Account 2", balance: "0.0350" },
  { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cB2", label: "Account 3", balance: "12.6400" },
];

const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const AccountsDiagram = () => {
  const [active, setActive] = useState(0);
  const account = MOCK_ACCOUNTS[active];

  return (
    <div className="demo-frame">
      <div className="demo-bar justify-between border-b border-primary pr-3 pl-4">
        <span className="text-control font-medium text-secondary">your dapp</span>
        <span className="flex min-w-0 items-center gap-2 text-control">
          <AddressAvatar address={account.address} size={16} />
          <span className="font-medium text-heading">MetaMask</span>
          <span className="truncate font-mono text-xs text-secondary">{short(account.address)}</span>
        </span>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_12.5rem]">
        <div className="flex min-w-0 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-control font-medium text-secondary">Connected accounts</span>
            <span className="font-mono text-xs text-muted">eth_requestAccounts() → string[]</span>
          </div>
          <div className="flex flex-col gap-0.5" role="group" aria-label="Connected accounts">
            {MOCK_ACCOUNTS.map((acct, index) => (
              <button
                key={acct.address}
                type="button"
                aria-pressed={index === active}
                onClick={() => setActive(index)}
                className={classNames(
                  "flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-2 text-left transition-colors duration-150",
                  index === active ? "bg-code-highlighted text-heading" : "text-secondary hover:bg-surfaceTint hover:text-heading",
                )}
              >
                <span className="w-2 font-mono text-xs text-muted tabular-nums">{index}</span>
                <AddressAvatar address={acct.address} size={20} />
                <span className="text-sm font-medium whitespace-nowrap">{acct.label}</span>
                <span className="ml-auto min-w-0 truncate font-mono text-xs text-secondary">{short(acct.address)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-primary p-4 max-md:border-t md:border-l">
          <span className="font-mono text-xs text-accent">{`accounts[${active}]`}</span>
          <div className="flex items-center gap-2.5">
            <AddressAvatar address={account.address} size={28} />
            <span className="text-base font-medium text-heading">{account.label}</span>
          </div>
          <span className="max-w-[21ch] font-mono text-xs break-all text-secondary">{account.address}</span>
          <span className="text-lg font-semibold text-heading tabular-nums">
            {account.balance}
            {" "}
            ETH
          </span>
        </div>
      </div>
    </div>
  );
};
