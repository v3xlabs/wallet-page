import type { Address, EIP1193Provider, Hex } from "viem";

export type EthereumWindow = Window & {
  ethereum?: EIP1193Provider;
};

export function getInjectedProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as EthereumWindow).ethereum;
}

export async function requestAccounts(
  provider: EIP1193Provider,
): Promise<Address[]> {
  return provider.request({
    method: "eth_requestAccounts",
    params: [],
  }) as Promise<Address[]>;
}

export async function getAccounts(
  provider: EIP1193Provider,
): Promise<Address[]> {
  return provider.request({
    method: "eth_accounts",
    params: [],
  }) as Promise<Address[]>;
}

export async function getChainId(provider: EIP1193Provider): Promise<Hex> {
  return provider.request({
    method: "eth_chainId",
    params: [],
  }) as Promise<Hex>;
}

export type RpcResult = unknown;

export async function rpc(
  provider: EIP1193Provider,
  method: string,
  params: unknown[] = [],
): Promise<RpcResult> {
  return provider.request({ method, params } as never);
}

/** JSON.stringify for `eth_signTypedData_v4` — uint256 fields must not be bigint literals. */
export function stringifyTypedData(data: unknown): string {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

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

export function requestEip6963Providers() {
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

export function listenEip6963Providers(
  onProvider: (detail: Eip6963ProviderDetail) => void,
  options?: { requestOnMount?: boolean },
): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
    if (detail?.info && detail?.provider) onProvider(detail);
  };

  window.addEventListener(
    "eip6963:announceProvider",
    handler as EventListener,
  );

  if (options?.requestOnMount !== false) {
    requestEip6963Providers();
  }

  return () => {
    window.removeEventListener(
      "eip6963:announceProvider",
      handler as EventListener,
    );
  };
}
