import { formatUnits } from "viem";

/** Single source of truth for truncated addresses: `0x225...c3B5`. */
export const truncateAddress = (address: string): string => {
  if (!address.startsWith("0x") || address.length <= 9) return address;

  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (
  value: bigint,
  decimals: number,
  symbol?: string,
) => {
  const amount = formatUnits(value, decimals);
  const trimmed = amount.replace(/\.?0+$/, "") || "0";

  return symbol ? `${trimmed} ${symbol}` : trimmed;
};

/** Localized currency display for fiat quantities. */
export const formatFiat = (value: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

/** Localized display for a value denominated in an asset: "0.0234 ETH". */
export const formatAssetAmount = (value: number, symbol: string, locale: string) =>
  `${new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 }).format(value)} ${symbol}`;

export const formatDeadline = (unixSeconds: bigint) => {
  const date = new Date(Number(unixSeconds) * 1000);

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
