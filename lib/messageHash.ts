import { hashMessage } from "viem";

/** EIP-191 digest for `personal_sign` (viem accepts the raw string). */
export function eip191MessageHash(message: string) {
  return hashMessage(message);
}
