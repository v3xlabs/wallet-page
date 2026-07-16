export type Currency = "USD" | "EUR";

/** Fixed mock FX rate — a real wallet sources this next to its token prices. */
export const EUR_PER_USD = 0.92;

export const CURRENCIES: { value: Currency; label: string; }[] = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export const toCurrency = (usd: number, currency: Currency) =>
  (currency === "USD" ? usd : usd * EUR_PER_USD);

/** At or above 1 unit: two fixed decimals. Below: four significant digits. */
export const formatPrice = (usd: number, currency: Currency, locale: string) => {
  const value = toCurrency(usd, currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...(value >= 1
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumSignificantDigits: 4 }),
  }).format(value);
};

/** Naive two-fixed-decimals formatter — kept only to show what it gets wrong. */
export const formatPriceNaive = (usd: number, currency: Currency, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(toCurrency(usd, currency));
