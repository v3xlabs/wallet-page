import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

/**
 * Single RPC client for every live read in the design demos. ENS and
 * contract-metadata lookups always resolve against Ethereum mainnet.
 */
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum.publicnode.com"),
});
