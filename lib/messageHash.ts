import { hashMessage } from "viem";

/** EIP-191 digest for `personal_sign` (viem accepts the raw string). */
export const eip191MessageHash = (message: string) => hashMessage(message);
