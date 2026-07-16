"use client";

import classNames from "classnames";
import type { FC } from "react";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { Address } from "viem";
import { isAddress } from "viem";

import type { DemoToken } from "../data";
import { formatTokenAmount } from "../data";
import { useDemoLocale } from "../locale";
import { TokenIcon } from "../ui";
import type { DiscoveredToken } from "./tokens";

const CheckDot: FC<{ checked: boolean; muted?: boolean; }> = ({ checked, muted }) => (
  <span
    aria-hidden
    className={classNames(
      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
      checked ? (muted ? "border-transparent bg-surfaceTint" : "border-transparent bg-accent") : "border-primary",
    )}
  >
    {checked && (
      <svg viewBox="0 0 16 16" fill="none" className={classNames("size-3", muted ? "text-muted" : "text-white")}>
        <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </span>
);

/**
 * The wallet-wide token list: everything the user holds or added on any
 * account, ticked when shown on this one. Accounts themselves are never
 * listed — one catalog, per-account visibility.
 */
export const ManageScreen: FC<{
  catalog: DemoToken[];
  enabledSymbols: string[];
  onToggle: (symbol: string) => void;
  onAddCustom: (address: Address) => void;
  discovered: DiscoveredToken[];
  onAddDiscovered: (item: DiscoveredToken) => void;
  onDismissDiscovered: (item: DiscoveredToken) => void;
}> = ({
  catalog,
  enabledSymbols,
  onToggle,
  onAddCustom,
  discovered,
  onAddDiscovered,
  onDismissDiscovered,
}) => {
  const locale = useDemoLocale();
  const [adding, setAdding] = useState(false);
  const [address, setAddress] = useState("");
  const valid = isAddress(address.trim(), { strict: false });

  const submit = () => {
    if (!valid) return;

    onAddCustom(address.trim() as Address);
    setAddress("");
    setAdding(false);
  };

  return (
    <div className="flex grow flex-col pb-4">
      <p className="px-4 pb-2 text-xs text-muted">
        Every token your wallet knows, across all accounts. Ticked tokens show on this account.
      </p>
      <div className="flex flex-col">
        {catalog.map((token) => {
          const always = token.symbol === "ETH";

          return (
            <button
              key={token.address}
              type="button"
              disabled={always}
              onClick={() => onToggle(token.symbol)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors not-disabled:hover:bg-surfaceMuted disabled:cursor-default"
            >
              <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={32} />
              <span className="flex min-w-0 grow flex-col gap-px">
                <span className="truncate text-sm font-medium text-primary">{token.name}</span>
                <span className="text-xs text-muted">{always ? "Always shown" : token.symbol}</span>
              </span>
              <CheckDot checked={always || enabledSymbols.includes(token.symbol)} muted={always} />
            </button>
          );
        })}
      </div>
      {adding
        ? (
            <div className="flex flex-col gap-2 px-4 pt-2">
              <input
                value={address}
                onChange={event => setAddress(event.target.value)}
                placeholder="Token contract address"
                className="demo-input font-mono"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => {
                    setAdding(false);
                    setAddress("");
                  }}
                >
                  Cancel
                </button>
                <button type="button" className="demo-btn demo-btn-primary" disabled={!valid} onClick={submit}>
                  Add token
                </button>
              </div>
            </div>
          )
        : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-accent hover:underline"
            >
              <FiPlus className="size-3.5" aria-hidden />
              Add token
            </button>
          )}
      <div className="mt-3 border-t border-primary pt-3">
        <div className="flex flex-col gap-0.5 px-4 pb-1">
          <span className="text-[11px] font-medium tracking-wide text-warning uppercase">
            Discovered on-chain
          </span>
          <span className="text-xs text-muted">
            Contracts that sent tokens to your address land here — the one route spam can take.
            Nothing shows on the account until you add it.
          </span>
        </div>
        {discovered.map(item => (
          <div key={item.token.address} className="flex items-center gap-3 px-4 py-2.5">
            <TokenIcon
              symbol={item.token.symbol}
              color={item.token.color}
              address={item.token.address}
              size={32}
            />
            <span className="flex min-w-0 grow flex-col items-start gap-px">
              <span className="w-full truncate text-sm font-medium text-primary">{item.token.name}</span>
              <span className="w-full truncate text-xs text-warning tabular-nums">
                {`${formatTokenAmount(item.token.balance, item.token, locale)} ${item.token.symbol} · ${item.note}`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onDismissDiscovered(item)}
              className="shrink-0 cursor-pointer rounded-full border border-primary bg-surfaceMuted px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surfaceTint hover:text-primary"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => onAddDiscovered(item)}
              className="shrink-0 cursor-pointer text-xs font-medium text-muted hover:text-primary hover:underline"
            >
              Add anyway
            </button>
          </div>
        ))}
        {discovered.length === 0 && (
          <p className="px-4 py-2 text-xs text-muted">Nothing waiting for review.</p>
        )}
      </div>
    </div>
  );
};
