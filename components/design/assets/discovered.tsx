"use client";

import type { FC } from "react";

import { formatTokenAmount } from "../data";
import { StatusPill, TokenIcon } from "../ui";
import type { DiscoveredToken } from "./tokens";

/**
 * Tokens found by indexing, quarantined below the fold. Nothing here enters
 * the primary list until the user explicitly adds it.
 */
export const DiscoveredSection: FC<{
  items: DiscoveredToken[];
  onAdd: (item: DiscoveredToken) => void;
  onDismiss: (item: DiscoveredToken) => void;
}> = ({ items, onAdd, onDismiss }) => (
  <div className="mt-2 border-t border-primary pt-3">
    <div className="flex flex-col gap-0.5 px-4 pb-1">
      <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Discovered</span>
      <span className="text-xs text-muted">Found on-chain — not added by you</span>
    </div>
    {items.map(item => (
      <div key={item.token.symbol} className="flex items-center gap-3 px-4 py-2.5">
        <TokenIcon symbol={item.token.symbol} color={item.token.color} address={item.token.address} size={36} />
        <span className="flex min-w-0 grow flex-col items-start gap-px">
          <span className="flex w-full min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-primary">{item.token.name}</span>
            {!item.verified && <StatusPill tone="destructive">Suspicious</StatusPill>}
          </span>
          <span className="w-full truncate text-xs text-muted tabular-nums">
            {formatTokenAmount(item.token.balance, item.token)}
            {" "}
            {item.token.symbol}
            {" · "}
            {item.note}
          </span>
        </span>
        {item.verified
          ? (
              <button
                type="button"
                onClick={() => onAdd(item)}
                className="shrink-0 cursor-pointer rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent6"
              >
                Add
              </button>
            )
          : (
              <button
                type="button"
                onClick={() => onDismiss(item)}
                className="shrink-0 cursor-pointer rounded-full border border-primary bg-surfaceMuted px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surfaceTint hover:text-primary"
              >
                Hide
              </button>
            )}
      </div>
    ))}
    {items.length === 0 && (
      <p className="px-4 py-2 text-xs text-muted">Nothing new to review.</p>
    )}
    <p className="px-4 pt-1 pb-4 text-[11px] text-muted">
      Discovered tokens never enter your list automatically — you add them.
    </p>
  </div>
);
