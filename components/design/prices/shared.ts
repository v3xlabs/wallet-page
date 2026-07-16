import type { DisplayCurrency } from "../data";
import { toDisplayCurrency } from "../data";

/**
 * Price display rule (see the sub-dollar demo): at or above 1 unit, two
 * fixed decimals; below, four significant digits so micro-prices stay honest.
 */
export const formatPrice = (usd: number, currency: DisplayCurrency, locale: string) => {
  const value = toDisplayCurrency(usd, currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...(value >= 1
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumSignificantDigits: 4 }),
  }).format(value);
};

/** Naive two-fixed-decimals formatter - kept only to show what it gets wrong. */
export const formatPriceNaive = (usd: number, currency: DisplayCurrency, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    toDisplayCurrency(usd, currency),
  );
