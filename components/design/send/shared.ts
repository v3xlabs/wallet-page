import type { Address } from "viem";
import { parseUnits } from "viem";

import { parseLocalizedDecimal, toBaseUnits } from "../../../lib/amounts";
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
export const formatDisplayCurrency = (usd: number, currency: DisplayCurrency, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    usd * currencyFor(currency).rate,
  );

/**
 * Localized amount parser (see /design/amounts): token amounts convert
 * digit-exactly into base units; fiat entry is a quote, so it may pass
 * through a float on its way to the FX rate and token price.
 */
export const parseAmount = (
  text: string,
  token: DemoToken,
  unit: "token" | "fiat",
  locale: string,
  rate = 1,
): bigint | undefined => {
  const parsed = parseLocalizedDecimal(text, locale);

  if (parsed === undefined) return;

  if (unit === "token") return toBaseUnits(parsed, token.decimals);

  try {
    const inToken = Number(parsed.coefficient) / 10 ** parsed.scale / rate / token.priceUsd;

    return parseUnits(inToken.toFixed(token.decimals), token.decimals);
  }
  catch {
    return;
  }
};
