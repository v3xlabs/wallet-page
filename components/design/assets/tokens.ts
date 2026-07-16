import { parseUnits } from "viem";

import type { DemoToken } from "../data";

/**
 * Local extras for the assets demo: dust positions worth under a dollar, and
 * two on-chain discoveries the user has not opted into — one legitimate, one
 * obvious airdrop spam.
 */

/** Real-but-negligible balances that would otherwise clutter the list. */
export const DUST_TOKENS: DemoToken[] = [
  {
    symbol: "TST",
    name: "Test Token",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000101",
    color: "#7b70c9",
    balance: parseUnits("1150", 18),
    priceUsd: 0.000_62,
    change24h: -3.4,
  },
  {
    symbol: "FAU",
    name: "Faucet Token",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000102",
    color: "#d6438a",
    balance: parseUnits("92.4", 18),
    priceUsd: 0.0041,
    change24h: 0.6,
  },
];

export type DiscoveredToken = {
  token: DemoToken;
  note: string;
};

/**
 * On-chain findings the user never opted into. Discovery is the one route
 * spam can take into the wallet, so everything here stays quarantined until
 * explicitly added.
 */
export const DISCOVERED: DiscoveredToken[] = [
  {
    token: {
      symbol: "CLAIM",
      name: "Visit site-claim.io ✅",
      decimals: 18,
      address: "0x0000000000000000000000000000000000000103",
      color: "#62688f",
      balance: parseUnits("40000", 18),
      priceUsd: 0,
      change24h: 0,
    },
    note: "Unverified contract",
  },
];
