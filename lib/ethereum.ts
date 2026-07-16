import type { Address, EIP1193Provider, Hex } from "viem";

/** Valid address for SSR preview / request tabs when disconnected. */
export const DEMO_PLACEHOLDER_ACCOUNT
  = "0x0000000000000000000000000000000000000001" as Address;

export type EthereumWindow = Window & {
  ethereum?: EIP1193Provider;
};

export const getInjectedProvider = (): EIP1193Provider | undefined => {
  if (globalThis.window === undefined) return undefined;

  return (globalThis as EthereumWindow).ethereum;
};

export const requestAccounts = async (
  provider: EIP1193Provider,
): Promise<Address[]> => provider.request({
  method: "eth_requestAccounts",
  params: [],
}) as Promise<Address[]>;

export const getAccounts = async (
  provider: EIP1193Provider,
): Promise<Address[]> => provider.request({
  method: "eth_accounts",
  params: [],
}) as Promise<Address[]>;

export const getChainId = async (provider: EIP1193Provider): Promise<Hex> =>
  provider.request({
    method: "eth_chainId",
    params: [],
  }) as Promise<Hex>;

export type RpcResult = unknown;

export const rpc = async (
  provider: EIP1193Provider,
  method: string,
  params: unknown[] = [],
): Promise<RpcResult> => provider.request({ method, params } as never);

/** JSON.stringify for RPC payloads — bigint fields must not be bigint literals. */
export const stringifyRpcData = (data: unknown): string =>
  JSON.stringify(data, (_key, value) =>
    (typeof value === "bigint" ? value.toString() : value),
  );

const demoJsonReplacer = (_key: string, value: unknown) => {
  if (typeof value === "bigint") return value.toString();

  return value;
};

/** Pretty-print any RPC result or error for demo Response tabs. */
export const formatDemoOutput = (value: unknown): string => {
  if (value === undefined) return "";

  if (value === null) return "null";

  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "bigint") return value.toString();

  if (value instanceof Error) {
    const extra = value as Error & { code?: unknown; data?: unknown; };

    if (extra.code !== undefined || extra.data !== undefined) {
      return formatDemoOutput({
        name: value.name,
        message: value.message,
        ...(extra.code === undefined ? {} : { code: extra.code }),
        ...(extra.data === undefined ? {} : { data: extra.data }),
      });
    }

    return value.message || value.name || "Error";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, demoJsonReplacer, 2);
    }
    catch {
      return String(value);
    }
  }

  return String(value);
};

export const formatError = (error: unknown): string => formatDemoOutput(error);

/** EIP-6963 provider detail from `eip6963:announceProvider`. */
export type Eip6963ProviderDetail = {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: EIP1193Provider;
};

export const requestEip6963Providers = () => {
  globalThis.dispatchEvent(new Event("eip6963:requestProvider"));
};

export const listenEip6963Providers = (
  onProvider: (detail: Eip6963ProviderDetail) => void,
  options?: { requestOnMount?: boolean; },
): (() => void) => {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;

    if (detail?.info && detail?.provider) onProvider(detail);
  };

  globalThis.addEventListener(
    "eip6963:announceProvider",
    handler as EventListener,
  );

  if (options?.requestOnMount !== false) {
    requestEip6963Providers();
  }

  return () => {
    globalThis.removeEventListener(
      "eip6963:announceProvider",
      handler as EventListener,
    );
  };
};
