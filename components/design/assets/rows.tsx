"use client";

import classNames from "classnames";
import type { FC } from "react";
import { FiChevronDown, FiEyeOff, FiMoreHorizontal } from "react-icons/fi";

import type { DemoToken } from "../data";
import { fiatValue, formatTokenAmount, formatUsd } from "../data";
import { TokenIcon } from "../ui";

/** 24h move, quietly toned: green up, red down, muted flat. */
export const Change: FC<{ token: DemoToken; }> = ({ token }) => {
  const rounded = Math.round(token.change24h * 10) / 10;

  if (rounded === 0) return <span className="text-xs text-muted tabular-nums">0.0%</span>;

  return (
    <span
      className={classNames(
        "text-xs tabular-nums",
        rounded > 0 ? "text-success" : "text-destructive",
      )}
    >
      {rounded > 0 ? `+${rounded.toFixed(1)}%` : `−${Math.abs(rounded).toFixed(1)}%`}
    </span>
  );
};

export const TokenRow: FC<{
  token: DemoToken;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onHide: () => void;
  /** Freshly promoted from Discovered — slides in once. */
  justAdded?: boolean;
}> = ({ token, menuOpen, onToggleMenu, onHide, justAdded }) => (
  <div style={justAdded ? { animation: "design-token-in 0.4s ease-out" } : undefined}>
    <div className="flex items-center gap-3 px-4 py-2.5">
      <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={36} />
      <span className="flex min-w-0 grow flex-col items-start gap-px">
        <span className="w-full truncate text-sm font-medium text-primary">{token.name}</span>
        <span className="w-full truncate text-xs text-muted tabular-nums">
          {formatTokenAmount(token.balance, token)}
          {" "}
          {token.symbol}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-px">
        <span className="text-sm font-medium text-primary tabular-nums">
          {formatUsd(fiatValue(token, token.balance))}
        </span>
        <Change token={token} />
      </span>
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={`More options for ${token.symbol}`}
        className={classNames(
          "-mr-1.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-surfaceMuted hover:text-primary",
          menuOpen ? "bg-surfaceMuted text-primary" : "text-muted",
        )}
      >
        <FiMoreHorizontal className="size-4" />
      </button>
    </div>
    {menuOpen && (
      <div className="-mt-1 flex justify-end px-4 pb-2">
        <button
          type="button"
          onClick={onHide}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-surfaceMuted px-2.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:text-destructive"
        >
          <FiEyeOff className="size-3.5" />
          Hide token
        </button>
      </div>
    )}
  </div>
);

/** Collapsed shelf for dust and user-hidden tokens. */
export const HiddenShelf: FC<{
  dust: DemoToken[];
  userHidden: DemoToken[];
  open: boolean;
  onToggle: () => void;
  onShow: (symbol: string) => void;
}> = ({ dust, userHidden, open, onToggle, onShow }) => {
  const count = dust.length + userHidden.length;
  const label = userHidden.length === 0
    ? `${count} low-value token${count === 1 ? "" : "s"} hidden`
    : `${count} tokens hidden`;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surfaceMuted"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surfaceMuted text-muted">
          <FiEyeOff className="size-4" />
        </span>
        <span className="grow text-xs font-medium text-muted">{label}</span>
        <FiChevronDown
          className={classNames("size-4 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && [...userHidden, ...dust].map(token => (
        <div key={token.symbol} className="flex items-center gap-3 px-4 py-2 opacity-60">
          <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={28} />
          <span className="flex min-w-0 grow flex-col items-start">
            <span className="w-full truncate text-[13px] font-medium text-secondary">{token.name}</span>
            <span className="w-full truncate text-[11px] text-muted tabular-nums">
              {formatTokenAmount(token.balance, token)}
              {" "}
              {token.symbol}
            </span>
          </span>
          <span className="text-xs text-muted tabular-nums">
            {formatUsd(fiatValue(token, token.balance))}
          </span>
          {userHidden.includes(token) && (
            <button
              type="button"
              onClick={() => onShow(token.symbol)}
              className="cursor-pointer text-xs font-medium text-accent hover:underline"
            >
              Show
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
