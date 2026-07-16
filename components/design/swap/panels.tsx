"use client";

import classNames from "classnames";
import type { PropsWithChildren } from "react";

import type { DemoToken } from "../data";
import { formatTokenAmount } from "../data";
import { useDemoLocale, useFiat } from "../locale";
import { Spinner, TokenIcon } from "../ui";
import type { Quote } from "./shared";
import { formatAmount } from "./shared";

/** Pill that names the token on a panel and opens the token selector. */
const TokenChip = ({ token, onClick }: { token: DemoToken; onClick: () => void; }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-primary bg-surface py-1 pr-2.5 pl-1 transition-colors hover:bg-surfaceTint"
  >
    <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={24} />
    <span className="text-sm font-semibold text-primary">{token.symbol}</span>
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5 text-muted">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const Panel = ({ label, children }: PropsWithChildren<{ label: string; }>) => (
  <div className="flex flex-col gap-2.5 rounded-2xl border border-primary bg-surfaceMuted/50 px-4 pt-3 pb-3.5">
    <span className="text-xs font-medium text-muted">{label}</span>
    {children}
  </div>
);

export const PayPanel = ({ token, amountText, payUsd, priceless, insufficient, onAmount, onMax, onPickToken }: {
  token: DemoToken;
  amountText: string;
  payUsd: number | undefined;
  /** Token has no price feed, so no fiat subvalue can be shown. */
  priceless: boolean;
  insufficient: boolean;
  onAmount: (text: string) => void;
  onMax: () => void;
  onPickToken: () => void;
}) => {
  const locale = useDemoLocale();
  const fiat = useFiat();

  return (
    <Panel label="You pay">
      <div className="flex items-center gap-2">
        <TokenChip token={token} onClick={onPickToken} />
        <input
          type="text"
          inputMode="decimal"
          value={amountText}
          onChange={e => onAmount(e.target.value)}
          placeholder="0"
          aria-label="Amount to pay"
          className={classNames(
            "min-w-0 grow border-none bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted tabular-nums",
            insufficient ? "text-destructive" : "text-primary",
          )}
          style={{ caretColor: "var(--vocs-color-accent)" }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
          <span className={insufficient ? "font-medium text-destructive" : undefined}>
            Balance:
            {" "}
            {formatTokenAmount(token.balance, token, locale)}
            {" "}
            {token.symbol}
          </span>
          <button
            type="button"
            onClick={onMax}
            className="cursor-pointer rounded-full border border-primary bg-surfaceMuted px-2 py-0.5 text-[11px] font-medium text-secondary transition-colors hover:bg-surfaceTint hover:text-primary"
          >
            Max
          </button>
        </span>
        <span className="text-xs text-muted tabular-nums">
          {priceless ? "" : fiat(payUsd ?? 0)}
        </span>
      </div>
    </Panel>
  );
};

export const ReceivePanel = ({ token, quote, quoting, unavailable, onPickToken }: {
  token: DemoToken;
  quote: Quote | undefined;
  quoting: boolean;
  /** The pair includes a token with no price feed, so nothing can be quoted. */
  unavailable: boolean;
  onPickToken: () => void;
}) => {
  const locale = useDemoLocale();
  const fiat = useFiat();

  return (
    <Panel label="You receive">
      <div className="flex items-center gap-2">
        <TokenChip token={token} onClick={onPickToken} />
        {quoting
          ? <span className="ml-auto h-7 w-28 animate-pulse rounded-md bg-surfaceTint" />
          : (
              <span
                className={classNames(
                  "min-w-0 grow truncate text-right text-2xl font-semibold tabular-nums",
                  quote ? "text-primary" : "text-muted",
                )}
              >
                {quote ? formatAmount(quote.receiveAmount, locale) : (unavailable ? "-" : "0")}
              </span>
            )}
      </div>
      <div className="flex items-center justify-between gap-2">
        {quoting
          ? (
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Spinner size={12} />
                Fetching best route…
              </span>
            )
          : (
              <span className="text-xs text-muted">
                {unavailable
                  ? "No price feed for this token - quote unavailable"
                  : (quote ? "Best of 4 quoted venues" : "")}
              </span>
            )}
        <span className="text-xs text-muted tabular-nums">
          {quoting || unavailable || token.priceUsd === 0 ? "" : fiat(quote?.receiveUsd ?? 0)}
        </span>
      </div>
    </Panel>
  );
};

/** Circular direction toggle straddling the seam between the two panels. */
export const FlipButton = ({ flips, onFlip }: { flips: number; onFlip: () => void; }) => (
  <button
    type="button"
    onClick={onFlip}
    aria-label="Reverse swap direction"
    className="relative z-10 mx-auto -my-4 flex size-9 cursor-pointer items-center justify-center rounded-full border border-primary bg-surface text-secondary transition-transform duration-300 hover:text-primary"
    style={{ transform: `rotate(${flips * 180}deg)` }}
  >
    <svg viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M8 3v10M4.5 9.5L8 13l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);
