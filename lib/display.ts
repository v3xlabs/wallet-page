import { formatUnits, type Address } from "viem";

/** `0x1234…abcd` for UI previews */
export function shortAddress(address: string, chars = 4) {
  if (!address.startsWith("0x") || address.length < 10) return address;
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export function formatTokenAmount(
  value: bigint,
  decimals: number,
  symbol?: string,
) {
  const amount = formatUnits(value, decimals);
  const trimmed = amount.replace(/\.?0+$/, "") || "0";
  return symbol ? `${trimmed} ${symbol}` : trimmed;
}

export function formatDeadline(unixSeconds: bigint) {
  const date = new Date(Number(unixSeconds) * 1000);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function isZeroAddress(address: string) {
  return /^0x0{40}$/i.test(address);
}

export function explorerAddressLabel(address: Address) {
  return shortAddress(address, 6);
}
