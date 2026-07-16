import type { Address } from "viem";
import {
  createSiweMessage,
  generateSiweNonce,
} from "viem/siwe";

export type { SiweMessage } from "viem/siwe";

export const SIWE_DEMO_STATEMENT = "Sign in to wallet.page demos.";

export const buildSiweMessage = (
  address: Address,
  chainId: number,
  nonce = generateSiweNonce(),
) => {
  const domain
    = globalThis.window === undefined ? "wallet.page" : globalThis.location.host;
  const uri
    = globalThis.window === undefined
      ? "https://wallet.page"
      : globalThis.location.origin;

  return createSiweMessage({
    address,
    chainId,
    domain,
    nonce,
    uri,
    version: "1",
    statement: SIWE_DEMO_STATEMENT,
  });
};

export { generateSiweNonce, parseSiweMessage } from "viem/siwe";
