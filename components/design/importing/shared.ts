import type { Address } from "viem";
import { english } from "viem/accounts";

/** What every import path produces: an account the wallet now shows. */
export type ImportResult = {
  address: Address;
  name: string;
  watchOnly?: boolean;
};

/** The canonical well-known test mnemonic — a demo value, never reuse it. */
export const DEMO_MNEMONIC = "test test test test test test test test test test test junk";

/** The well-known junk private key — a demo value, never reuse it. */
export const DEMO_PRIVATE_KEY
  = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/** Set lookup over the fixed 2,048-word BIP-39 list. */
export const WORDLIST = new Set<string>(english);

/** Paste normalization: casing folded, any whitespace collapsed. */
export const normalizePhrase = (text: string) =>
  text.trim().toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

export const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;
