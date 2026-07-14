import type { Address } from "viem";
import { parseUnits } from "viem";

import type { DemoToken } from "../data";
import { TOKENS } from "../data";

export type Recipient = { address: Address; name?: string; };

export const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Flat mock network fee: 21k gas at plausible mainnet prices. */
export const FEE_WEI = parseUnits("0.00042", 18);

export const ETH = TOKENS[0];

export type DisplayCurrency = "USD" | "EUR";

/** Display currencies with fixed demo FX rates (units per USD). */
export const CURRENCIES: readonly { value: DisplayCurrency; symbol: string; rate: number; }[] = [
  { value: "USD", symbol: "$", rate: 1 },
  { value: "EUR", symbol: "€", rate: 0.92 },
];

export const currencyFor = (currency: DisplayCurrency) =>
  CURRENCIES.find(entry => entry.value === currency) ?? CURRENCIES[0];

/** Format a USD value in the selected display currency. */
export const formatDisplayCurrency = (usd: number, currency: DisplayCurrency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    usd * currencyFor(currency).rate,
  );

/**
 * Forgiving amount parser: tolerates both decimal separators, returns base
 * units, and converts from the display currency when that is the entry unit.
 */
export const parseAmount = (
  text: string,
  token: DemoToken,
  unit: "token" | "fiat",
  rate = 1,
): bigint | undefined => {
  const normalized = text.replace(",", ".");

  if (!/^\d*\.?\d*$/.test(normalized) || normalized === "" || normalized === ".") return;

  try {
    const inToken = unit === "fiat"
      ? Number(normalized) / rate / token.priceUsd
      : Number(normalized);

    return parseUnits(inToken.toFixed(token.decimals), token.decimals);
  }
  catch {
    return;
  }
};
