"use client";

import classNames from "classnames";

import { formatBaseUnits } from "../../../lib/amounts";
import type { DemoToken } from "../data";
import { formatTokenAmount, usdValue } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { useDemoLocale, useDenomination, useDisplayValue } from "../locale";
import { PrimaryButton, TokenIcon } from "../ui";
import type { Recipient } from "./shared";
import { FEE_WEI, parseAmount, truncate } from "./shared";

/**
 * The asset being sent - always the asset, even while the amount is being
 * typed in fiat ("50 EUR worth of WETH" still sends WETH).
 */
const AssetChip = ({ token, onPickAsset }: {
  token: DemoToken;
  onPickAsset: () => void;
}) => (
  <button
    type="button"
    onClick={onPickAsset}
    className="relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-primary bg-surface pr-2 pl-1.5 transition-[background-color,transform] duration-150 after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] hover:bg-surfaceTint active:scale-[0.98]"
  >
    <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={20} />
    <span className="text-sm font-semibold text-heading">{token.symbol}</span>
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5 text-muted">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export const AmountScreen = ({ token, recipient, amountText, unit, onAmount, onUnit, onPickAsset, onContinue }: {
  token: DemoToken;
  recipient: Recipient;
  amountText: string;
  unit: "token" | "fiat";
  onAmount: (value: string) => void;
  onUnit: (unit: "token" | "fiat") => void;
  onPickAsset: () => void;
  onContinue: () => void;
}) => {
  const locale = useDemoLocale();
  const denomination = useDenomination();
  const display = useDisplayValue();

  const amount = parseAmount(amountText, token, unit, locale, denomination.rate);
  const isInsufficient = amount !== undefined && amount > token.balance;
  // Tokens resolved from a pasted contract carry no price feed.
  const isPriceless = token.priceUsd === 0;
  const converted
    = amount === undefined
      ? undefined
      : (unit === "token"
          ? display(usdValue(token, amount))
          : `${formatTokenAmount(amount, token, locale)} ${token.symbol}`);

  const setFraction = (fraction: number) => {
    // Max on the gas token leaves room for the network fee.
    const max = token.symbol === "ETH" && fraction === 1
      ? token.balance - FEE_WEI
      : (token.balance * BigInt(Math.round(fraction * 100))) / 100n;

    onUnit("token");
    // Exact and localized, so what lands in the field always parses back.
    onAmount(formatBaseUnits(max, locale, token.decimals) ?? "");
  };

  return (
    <>
      <div className="flex items-center gap-1.5 px-4 pt-1 text-control text-secondary">
        To
        <EnsAvatar address={recipient.address} name={recipient.name} size={18} />
        <span className="font-medium text-heading">
          {recipient.name ?? truncate(recipient.address)}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-5">
        <div className="flex flex-col gap-1 rounded-xl border border-primary bg-surfaceMuted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <AssetChip token={token} onPickAsset={onPickAsset} />
            <div className="flex gap-0.5">
              {[0.25, 0.5, 0.75, 1].map(fraction => (
                <button
                  key={fraction}
                  type="button"
                  onClick={() => setFraction(fraction)}
                  className="relative h-8 cursor-pointer rounded-md bg-surfaceTint px-2 text-xs font-medium text-secondary tabular-nums transition-[color,transform] duration-150 after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] hover:text-heading active:scale-[0.96]"
                >
                  {fraction === 1 ? "Max" : `${fraction * 100}%`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline justify-center gap-1 py-6">
            {unit === "fiat" && (
              <span className="text-2xl font-semibold text-muted">{denomination.symbol}</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              aria-label="Amount"
              value={amountText}
              onChange={e => onAmount(e.target.value)}
              placeholder="0"
              className={classNames(
                "w-full max-w-48 border-none bg-transparent text-center text-4xl font-semibold tracking-tight tabular-nums outline-none placeholder:text-muted",
                isInsufficient ? "text-destructive" : "text-primary",
              )}
              style={{ caretColor: "var(--vocs-color-accent)" }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-control">
            {isPriceless
              ? (
                  <span className="text-secondary">No price feed for this token</span>
                )
              : (
                  <button
                    type="button"
                    onClick={() => onUnit(unit === "token" ? "fiat" : "token")}
                    className="flex h-8 cursor-pointer items-center gap-1 text-secondary tabular-nums transition-colors duration-150 hover:text-heading"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                      <path d="M11 2.5l2.5 2.5L11 7.5M13.5 5h-11M5 13.5L2.5 11 5 8.5M2.5 11h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {converted ?? (unit === "token" ? display(0) : `0 ${token.symbol}`)}
                  </button>
                )}
            <button
              type="button"
              onClick={() => setFraction(1)}
              title="Use full balance"
              className="h-8 cursor-pointer text-secondary tabular-nums transition-colors duration-150 hover:text-heading"
            >
              {formatTokenAmount(token.balance, token, locale)}
              {" "}
              {token.symbol}
            </button>
          </div>
        </div>
        {isInsufficient && (
          <p className="text-xs font-medium text-destructive">
            Exceeds your
            {" "}
            {formatTokenAmount(token.balance, token, locale)}
            {" "}
            {token.symbol}
            {" "}
            balance
          </p>
        )}
      </div>
      <div className="px-4 pt-5 pb-4">
        <PrimaryButton
          onClick={onContinue}
          disabled={amount === undefined || amount === 0n || isInsufficient}
        >
          Review
        </PrimaryButton>
      </div>
    </>
  );
};
