"use client";

import classNames from "classnames";
import { formatUnits } from "viem";

import type { DemoToken } from "../data";
import { fiatValue, formatTokenAmount } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { PrimaryButton, TokenIcon } from "../ui";
import type { DisplayCurrency, Recipient } from "./shared";
import { currencyFor, FEE_WEI, formatDisplayCurrency, parseAmount, truncate } from "./shared";

/**
 * The asset being sent — always the asset, even while the amount is being
 * typed in fiat ("50 EUR worth of WETH" still sends WETH).
 */
const AssetChip = ({ token, onPickAsset }: {
  token: DemoToken;
  onPickAsset: () => void;
}) => (
  <button
    type="button"
    onClick={onPickAsset}
    className="flex cursor-pointer items-center gap-2 rounded-full border border-primary bg-surfaceMuted py-1 pr-2.5 pl-1 transition-colors hover:bg-surfaceTint"
  >
    <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={24} />
    <span className="text-sm font-semibold text-primary">{token.symbol}</span>
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5 text-muted">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export const AmountScreen = ({ token, recipient, amountText, unit, currency, onAmount, onUnit, onPickAsset, onContinue }: {
  token: DemoToken;
  recipient: Recipient;
  amountText: string;
  unit: "token" | "fiat";
  currency: DisplayCurrency;
  onAmount: (value: string) => void;
  onUnit: (unit: "token" | "fiat") => void;
  onPickAsset: () => void;
  onContinue: () => void;
}) => {
  const fx = currencyFor(currency);
  const amount = parseAmount(amountText, token, unit, fx.rate);
  const insufficient = amount !== undefined && amount > token.balance;
  // Tokens resolved from a pasted contract carry no price feed.
  const priceless = token.priceUsd === 0;
  const converted
    = amount === undefined
      ? undefined
      : (unit === "token"
          ? formatDisplayCurrency(fiatValue(token, amount), currency)
          : `${formatTokenAmount(amount, token)} ${token.symbol}`);

  const setFraction = (fraction: number) => {
    // Max on the gas token leaves room for the network fee.
    const max = token.symbol === "ETH" && fraction === 1
      ? token.balance - FEE_WEI
      : (token.balance * BigInt(Math.round(fraction * 100))) / 100n;
    const inToken = formatUnits(max, token.decimals);

    onUnit("token");
    onAmount(formatTokenAmount(max, token) === "<0.0001" ? inToken : Number(inToken).toString());
  };

  return (
    <>
      <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted">
        To
        <EnsAvatar address={recipient.address} name={recipient.name} size={18} />
        <span className="font-medium text-secondary">
          {recipient.name ?? truncate(recipient.address)}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-primary bg-surfaceMuted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <AssetChip token={token} onPickAsset={onPickAsset} />
            <div className="flex gap-1">
              {[0.25, 0.5, 0.75, 1].map(fraction => (
                <button
                  key={fraction}
                  type="button"
                  onClick={() => setFraction(fraction)}
                  className="cursor-pointer rounded-full border border-primary bg-surfaceMuted px-2 py-0.5 text-[11px] font-medium text-secondary transition-colors hover:bg-surfaceTint hover:text-primary"
                >
                  {fraction === 1 ? "Max" : `${fraction * 100}%`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline justify-center gap-1 py-4">
            {unit === "fiat" && (
              <span className="text-2xl font-semibold text-muted">{fx.symbol}</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={amountText}
              onChange={e => onAmount(e.target.value)}
              placeholder="0"
              className={classNames(
                "w-full max-w-44 border-none bg-transparent text-center text-4xl font-semibold outline-none placeholder:text-muted",
                insufficient ? "text-destructive" : "text-primary",
              )}
              style={{ caretColor: "var(--vocs-color-accent)" }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            {priceless
              ? (
                  <span className="text-xs text-muted">No price feed for this token</span>
                )
              : (
                  <button
                    type="button"
                    onClick={() => onUnit(unit === "token" ? "fiat" : "token")}
                    className="flex cursor-pointer items-center gap-1 rounded-full text-xs text-secondary transition-colors hover:text-primary"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                      <path d="M11 2.5l2.5 2.5L11 7.5M13.5 5h-11M5 13.5L2.5 11 5 8.5M2.5 11h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {converted ?? (unit === "token" ? formatDisplayCurrency(0, currency) : `0 ${token.symbol}`)}
                  </button>
                )}
            <button
              type="button"
              onClick={() => setFraction(1)}
              title="Use full balance"
              className="cursor-pointer text-xs text-muted transition-colors tabular-nums hover:text-primary"
            >
              {formatTokenAmount(token.balance, token)}
              {" "}
              {token.symbol}
            </button>
          </div>
        </div>
        {insufficient && (
          <p className="text-xs font-medium text-destructive">
            Exceeds your
            {" "}
            {formatTokenAmount(token.balance, token)}
            {" "}
            {token.symbol}
            {" "}
            balance
          </p>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <PrimaryButton
          onClick={onContinue}
          disabled={amount === undefined || amount === 0n || insufficient}
        >
          Review
        </PrimaryButton>
      </div>
    </>
  );
};
