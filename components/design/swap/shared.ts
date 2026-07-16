import { formatUnits, parseUnits } from "viem";

import { formatBaseUnits, parseLocalizedDecimal } from "../../../lib/amounts";
import type { DemoToken } from "../data";
import { TOKENS } from "../data";

/** Default pair, looked up by symbol so reordering TOKENS can't break it. */
export const ETH = TOKENS.find(token => token.symbol === "ETH") ?? TOKENS[0];
export const USDC = TOKENS.find(token => token.symbol === "USDC") ?? TOKENS[0];

/** Flat mock gas for a routed swap — costlier than a bare transfer. */
export const NETWORK_FEE_WEI = parseUnits("0.0009", 18);

/** The wallet's cut of every swap: 0.25%, always shown to the user. */
export const APP_FEE_RATE = 0.0025;

/**
 * Mock depth of the quoted route. Deliberately small enough that the demo
 * portfolio can push a trade into visible price impact.
 */
export const POOL_DEPTH_USD = 80_000;

/** Impact past this is worth flagging; past HIGH it needs acknowledgement. */
export const IMPACT_WARN_PCT = 1;
export const IMPACT_HIGH_PCT = 5;

export const SLIPPAGES = [0.1, 0.5, 1] as const;

export type Slippage = (typeof SLIPPAGES)[number];

export type Quote = {
  payAmount: number;
  payUsd: number;
  impactPct: number;
  impactUsd: number;
  appFeeUsd: number;
  receiveAmount: number;
  receiveUsd: number;
};

/** Token balance as a plain number, for comparisons against typed amounts. */
export const balanceOf = (token: DemoToken) =>
  Number(formatUnits(token.balance, token.decimals));

/**
 * Localized amount parser (see /design/amounts). The quote engine works in
 * floats, so the exact decimal converts to a number at this boundary.
 */
export const parsePayAmount = (text: string, locale: string): number | undefined => {
  const parsed = parseLocalizedDecimal(text, locale);

  if (parsed === undefined) return;

  return Number(parsed.coefficient) / 10 ** parsed.scale;
};

/**
 * Local stand-in for an aggregator quote: spot price minus a depth-based
 * price impact and the disclosed app fee. Deterministic on purpose.
 */
export const computeQuote = (pay: DemoToken, receive: DemoToken, payAmount: number): Quote => {
  const payUsd = payAmount * pay.priceUsd;
  const impactPct = Math.min((payUsd / POOL_DEPTH_USD) * 100, 15);
  const impactUsd = payUsd * (impactPct / 100);
  const appFeeUsd = payUsd * APP_FEE_RATE;
  const receiveUsd = Math.max(payUsd - impactUsd - appFeeUsd, 0);
  const receiveAmount = receiveUsd / receive.priceUsd;

  return { payAmount, payUsd, impactPct, impactUsd, appFeeUsd, receiveAmount, receiveUsd };
};

/** Worst acceptable fill after the chosen slippage tolerance. */
export const minReceived = (quote: Quote, slippage: Slippage) =>
  quote.receiveAmount * (1 - slippage / 100);

/** Human-friendly plain-number token quantity, mirroring formatTokenAmount. */
export const formatAmount = (value: number, locale: string) => {
  if (value === 0) return "0";

  if (value > 0 && value < 0.0001) return "<0.0001";

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value < 1 ? 6 : (value < 1000 ? 4 : 2),
  }).format(value);
};

/** Spot exchange rate line: "1 ETH = 3,892.40 USDC". */
export const formatRate = (from: DemoToken, to: DemoToken, locale: string) => {
  const rate = from.priceUsd / to.priceUsd;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: rate < 1 ? 6 : 2,
  }).format(rate);

  return `1 ${from.symbol} = ${formatted} ${to.symbol}`;
};

/** Full spendable balance as input text; the gas token reserves the fee. */
export const maxPayText = (token: DemoToken, locale: string) => {
  const max = token.symbol === "ETH" ? token.balance - NETWORK_FEE_WEI : token.balance;

  // Exact and localized, so what lands in the field always parses back.
  return formatBaseUnits(max, locale, token.decimals) ?? "";
};
