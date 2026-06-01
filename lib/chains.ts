import type { Hex } from "viem";

export type DemoChain = {
  name: string;
  chainId: Hex;
  rpcUrl: string;
};

export const DEMO_CHAINS: DemoChain[] = [
  {
    name: "Ethereum Mainnet",
    chainId: "0x1",
    rpcUrl: "https://ethereum.publicnode.com",
  },
  {
    name: "Sepolia",
    chainId: "0xaa36a7",
    rpcUrl: "https://ethereum-sepolia.publicnode.com",
  },
  {
    name: "Holesky",
    chainId: "0x4268",
    rpcUrl: "https://ethereum-holesky.publicnode.com",
  },
  {
    name: "Base",
    chainId: "0x2105",
    rpcUrl: "https://base.publicnode.com",
  },
  {
    name: "Optimism",
    chainId: "0xa",
    rpcUrl: "https://optimism.publicnode.com",
  },
];

export function getDemoChain(chainId: Hex) {
  return DEMO_CHAINS.find(c => c.chainId.toLowerCase() === chainId.toLowerCase());
}
