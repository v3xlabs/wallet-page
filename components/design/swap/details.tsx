"use client";

import classNames from "classnames";
import type { ReactNode } from "react";
import { useState } from "react";

import type { DemoToken } from "../data";
import { formatTokenAmount, usdValue } from "../data";
import { useDemoLocale, useDisplayValue } from "../locale";
import { Segmented } from "../ui";
import type { Quote, Slippage } from "./shared";
import {
  ETH,
  formatAmount,
  formatRate,
  IMPACT_HIGH_PCT,
  IMPACT_WARN_PCT,
  minReceived,
  NETWORK_FEE_WEI,
  SLIPPAGES,
} from "./shared";

const DetailRow = ({ label, value, caption, tone }: {
  label: string;
  value: ReactNode;
  caption?: string;
  tone?: string;
}) => (
  <div className="flex flex-col gap-0.5 px-4 py-2.5">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className={classNames("text-right text-[13px] font-medium tabular-nums", tone ?? "text-primary")}>
        {value}
      </span>
    </div>
    {caption !== undefined && <span className="text-[11px] text-muted">{caption}</span>}
  </div>
);

/** Tone for the price-impact figure: quiet until it deserves attention. */
export const impactTone = (impactPct: number) =>
  (impactPct > IMPACT_HIGH_PCT
    ? "text-destructive"
    : (impactPct > IMPACT_WARN_PCT ? "text-warning" : "text-primary"));

export const SwapDetails = ({ pay, receive, quote, slippage, onSlippage }: {
  pay: DemoToken;
  receive: DemoToken;
  quote: Quote;
  slippage: Slippage;
  onSlippage: (slippage: Slippage) => void;
}) => {
  const locale = useDemoLocale();
  const display = useDisplayValue();
  const [open, setOpen] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [from, to] = inverted ? [receive, pay] : [pay, receive];
  const networkFeeUsd = usdValue(ETH, NETWORK_FEE_WEI);

  return (
    <div className="rounded-2xl border border-primary">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left"
      >
        <span className="text-[13px] font-medium text-primary tabular-nums">{formatRate(from, to, locale)}</span>
        <span className="flex items-center gap-2">
          {!open && quote.impactPct > IMPACT_WARN_PCT && (
            <span className={classNames("text-xs font-medium tabular-nums", impactTone(quote.impactPct))}>
              -
              {quote.impactPct.toFixed(2)}
              %
            </span>
          )}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={classNames("size-3.5 text-muted transition-transform", open && "rotate-180")}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="divide-y divide-(--vocs-border-color-primary) border-t border-primary">
          <DetailRow
            label="Rate"
            value={(
              <button
                type="button"
                onClick={() => setInverted(!inverted)}
                title="Invert rate"
                className="flex cursor-pointer items-center gap-1 tabular-nums transition-colors hover:text-accent"
              >
                {formatRate(from, to, locale)}
                <svg viewBox="0 0 16 16" fill="none" className="size-3 text-muted">
                  <path d="M11 2.5l2.5 2.5L11 7.5M13.5 5h-11M5 13.5L2.5 11 5 8.5M2.5 11h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          />
          <DetailRow
            label="Price impact"
            value={`-${quote.impactPct.toFixed(2)}% · ${display(quote.impactUsd)}`}
            tone={impactTone(quote.impactPct)}
          />
          <DetailRow
            label="Route"
            value="Best of 4 quoted venues"
            caption="Quoting several venues routes every swap to whichever fills it best."
          />
          <DetailRow
            label="Network fee"
            value={`${formatTokenAmount(NETWORK_FEE_WEI, ETH, locale)} ETH · ${display(networkFeeUsd)}`}
          />
          <DetailRow
            label="App fee"
            value={`0.25% · ${display(quote.appFeeUsd)}`}
            caption="shown, never hidden"
          />
          <div className="flex flex-col gap-2 px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-secondary">Slippage</span>
              <Segmented
                fit
                options={SLIPPAGES.map(option => ({ value: `${option}`, label: `${option}%` }))}
                value={`${slippage}`}
                onChange={value => onSlippage(Number(value) as Slippage)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-secondary">Minimum received</span>
              <span className="text-[13px] font-medium text-primary tabular-nums">
                {formatAmount(minReceived(quote, slippage), locale)}
                {" "}
                {receive.symbol}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
