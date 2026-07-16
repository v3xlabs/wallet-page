import type { Address } from "viem";
import { mnemonicToAccount } from "viem/accounts";

/**
 * The canonical well-known test mnemonic. Demo value only - it is public
 * knowledge, so anything derived from it is permanently insecure.
 */
export const MNEMONIC = "test test test test test test test test test test test junk";

export const WORDS = MNEMONIC.split(" ");

/** Account 1 of the demo phrase. Deterministic, so computed once at module scope. */
export const ACCOUNT_ADDRESS = mnemonicToAccount(MNEMONIC).address;

export const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;
