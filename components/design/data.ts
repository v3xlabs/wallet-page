import type { Address } from "viem";
import { formatUnits, parseUnits } from "viem";

/**
 * One fictional-but-plausible portfolio shared by every design demo, so the
 * whole section reads as a single wallet belonging to a single user.
 */

export type DemoToken = {
  symbol: string;
  name: string;
  decimals: number;
  /** Mainnet contract (zero address for native ETH) - keys the icon artwork. */
  address: Address;
  /** Fallback brand color when no icon artwork exists. */
  color: string;
  /** Balance in base units. */
  balance: bigint;
  priceUsd: number;
  /** 24h change in percent. */
  change24h: number;
};

export const TOKENS: DemoToken[] = [
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000",
    color: "#627eea",
    balance: parseUnits("1.2847", 18),
    priceUsd: 3892.4,
    change24h: 2.4,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    color: "#ec4899",
    balance: parseUnits("0.35", 18),
    priceUsd: 3892.4,
    change24h: 2.4,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    color: "#2775ca",
    balance: parseUnits("2450.55", 6),
    priceUsd: 1,
    change24h: 0,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    color: "#f5ac37",
    balance: parseUnits("180.42", 18),
    priceUsd: 0.9998,
    change24h: -0.01,
  },
  {
    symbol: "USDS",
    name: "Sky Dollar",
    decimals: 18,
    address: "0xdC035D45d973E3EC169d2276DDab16f1e407384F",
    color: "#18a05e",
    balance: parseUnits("96.10", 18),
    priceUsd: 1.0001,
    change24h: 0.01,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    color: "#f09242",
    balance: parseUnits("0.0512", 8),
    priceUsd: 97_140,
    change24h: -1.2,
  },
];

/** The demo user's own account. */
export const SELF = {
  name: "luc.eth",
  address: "0x225f137127d9067788314bc7fcc1f36746a3c3B5" as Address,
};

/** A second wallet account for flows that switch between accounts. */
export const ACCOUNT_2 = {
  name: "Account 2",
  address: "0x3f8CBe7177E4cC2Cb1f9AB1e26dA5F2b84942A6d" as Address,
};

/**
 * Contracts the demos reference, kept in one place so every demo cites the
 * same addresses and they stay maintainable.
 */

/** Canonical Permit2 - the spender granted allowances in demos. */
export const PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

/** Contract an EIP-7702 authorization would delegate the account to. */
export const DELEGATE_ADDRESS: Address = "0x63c0C19a282a1B52b07dD5a65b58948A07DAE32B";

/** Unverified contract used by blind/undecodable-call scenarios. */
export const UNKNOWN_CONTRACT_ADDRESS: Address = "0x7F2a9bE4C1b5cD83Fd91c2aE9d3C4E5F6a7B8C9D";

/** Address book used for recipient suggestions and ENS-style lookups. */
export const CONTACTS: { name: string; address: Address; }[] = [
  { name: "vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { name: "luc.eth", address: "0x225f137127d9067788314bc7fcc1f36746a3c3B5" },
  { name: "κασσάνδρα.eth", address: "0x1d60C34f508BbBd7f1cb50b375c4CdD25e718D1c" },
];

/** Fiat value of a token quantity given in base units. */
export const fiatValue = (token: DemoToken, amount: bigint) =>
  Number(formatUnits(amount, token.decimals)) * token.priceUsd;

export type DisplayCurrency = "USD" | "EUR";

/**
 * Display currencies with fixed demo FX rates (units per USD) - a real
 * wallet sources rates next to its token prices.
 */
export const CURRENCY_INFO: Record<DisplayCurrency, { symbol: string; rate: number; }> = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
};

export const DISPLAY_CURRENCIES: readonly DisplayCurrency[] = ["USD", "EUR"];

/** A USD amount converted into the selected display currency. */
export const toDisplayCurrency = (usd: number, currency: DisplayCurrency) =>
  usd * CURRENCY_INFO[currency].rate;

/**
 * Human-friendly token quantity: enough precision to be honest, few enough
 * digits to be readable. Display only - never round what gets signed. The
 * float only picks the precision tier; Intl formats the exact base units
 * (see /design/amounts/implementation).
 */
export const formatTokenAmount = (amount: bigint, token: DemoToken, locale: string) => {
  const value = Number(formatUnits(amount, token.decimals));

  if (value === 0) return "0";

  if (value < 0.0001) return "<0.0001";

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value < 1 ? 6 : (value < 1000 ? 4 : 2),
  }).format(`${amount}E-${token.decimals}` as Intl.StringNumericLiteral);
};
