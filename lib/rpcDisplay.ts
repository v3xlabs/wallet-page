export type RpcCall = {
  method: string;
  params?: unknown[];
};

/** Pretty-print for demo RPC tab (bigint-safe). */
export function formatRpcCall({ method, params = [] }: RpcCall): string {
  const payload = { method, params };

  return JSON.stringify(
    payload,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
}
