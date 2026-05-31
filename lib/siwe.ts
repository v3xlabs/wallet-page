import type { Address } from "viem";
import {
  createSiweMessage,
  generateSiweNonce,
  parseSiweMessage,
} from "viem/siwe";

export { generateSiweNonce, parseSiweMessage };
export type { SiweMessage } from "viem/siwe";

export const SIWE_DEMO_STATEMENT = "Sign in to wallet.page demos.";

export function buildSiweMessage(
  address: Address,
  chainId: number,
  nonce = generateSiweNonce(),
) {
  const domain =
    typeof window !== "undefined" ? window.location.host : "wallet.page";
  const uri =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wallet.page";

  return createSiweMessage({
    address,
    chainId,
    domain,
    nonce,
    uri,
    version: "1",
    statement: SIWE_DEMO_STATEMENT,
  });
}
