"use client";

import classNames from "classnames";
import type { FC, PropsWithChildren } from "react";
import type { Address } from "viem";

import { ACCOUNT_2, SELF, TOKENS, usdValue } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { useDisplayValue } from "../locale";

export const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export type Account = { name: string; address: Address; balanceUsd: number; };

export const ACCOUNTS: Account[] = [
  {
    name: SELF.name,
    address: SELF.address,
    balanceUsd: TOKENS.reduce((sum, token) => sum + usdValue(token, token.balance), 0),
  },
  {
    name: ACCOUNT_2.name,
    address: ACCOUNT_2.address,
    balanceUsd: 1240.18,
  },
];

export const SectionLabel: FC<PropsWithChildren> = ({ children }) => (
  <span className="px-1 text-[11px] font-medium tracking-wide text-muted uppercase">
    {children}
  </span>
);

/** Bordered list container the connect screens stack their rows inside. */
export const RowGroup: FC<PropsWithChildren> = ({ children }) => (
  <div className="w-full divide-y divide-(--vocs-border-color-primary) overflow-hidden rounded-xl border border-primary bg-surfaceMuted/50">
    {children}
  </div>
);

export const AccountRow = ({ account, selected, onSelect }: {
  account: Account;
  selected: boolean;
  onSelect: () => void;
}) => {
  const display = useDisplayValue();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(
        "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors",
        selected ? "bg-accenta2" : "hover:bg-surfaceMuted",
      )}
    >
      <EnsAvatar
        address={account.address}
        name={account.name.includes(".") ? account.name : undefined}
        size={32}
      />
      <span className="flex min-w-0 grow flex-col gap-px">
        <span className="truncate text-sm font-medium text-primary">{account.name}</span>
        <span className="font-mono text-[11px] text-muted">{truncate(account.address)}</span>
      </span>
      <span className="text-xs text-secondary tabular-nums">{display(account.balanceUsd)}</span>
      <span
        className={classNames(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-accent" : "border-primary",
        )}
        aria-hidden
      >
        {selected && <span className="size-2 rounded-full bg-accent" />}
      </span>
    </button>
  );
};
