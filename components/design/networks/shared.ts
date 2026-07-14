/** The dapp origin used by the wallet_addEthereumChain scenario. */
export const ORIGIN = "app.example.org";

export type RpcSource = "wallet" | "user" | "app";

export const SOURCE_LABELS: Record<RpcSource, string> = {
  wallet: "wallet default",
  user: "user-configured",
  app: `added by ${ORIGIN}`,
};

/** Brand color used for Hoodi in both networks demos. */
export const HOODI_COLOR = "#14b8a6";
