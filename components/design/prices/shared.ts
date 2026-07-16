import { formatAssetAmount } from "../../../lib/display";
import type { Denomination } from "../data";

/**
 * Price display rule (see the sub-dollar demo): at or above 1 unit, two
 * fixed decimals; below, four significant digits so micro-prices stay
 * honest. Asset denominations are plain sig-digit amounts - fixed decimals
 * only ever made sense for fiat.
 */
export const formatPrice = (quoted: number, denomination: Denomination, locale: string) => {
  const value = quoted * denomination.rate;

  if (denomination.kind === "asset") return formatAssetAmount(value, denomination.code, locale);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: denomination.code,
    ...(value >= 1
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumSignificantDigits: 4 }),
  }).format(value);
};

/** Naive two-fixed-decimals formatter - kept only to show what it gets wrong. */
export const formatPriceNaive = (quoted: number, denomination: Denomination, locale: string) => {
  const value = quoted * denomination.rate;

  return denomination.kind === "asset"
    ? `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${denomination.code}`
    : new Intl.NumberFormat(locale, { style: "currency", currency: denomination.code }).format(value);
};
