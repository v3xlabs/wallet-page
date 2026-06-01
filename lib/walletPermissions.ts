/** Helpers for [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255) permission objects. */

export type WalletPermissionLike = {
  parentCapability: string;
  invoker?: string;
  id?: string;
  date?: number;
  caveats?: { type: string; value: unknown; }[];
};

/** RPC methods and parent capabilities referenced across wallet.page docs. */
export const KNOWN_CAPABILITIES: readonly string[] = [
  "eth_accounts",
  "eth_requestAccounts",
  "eth_coinbase",
  "eth_sendRawTransaction",
  "eth_sendTransaction",
  "eth_sign",
  "eth_signTypedData_v1",
  "eth_signTypedData_v2",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "wallet_getAssets",
  "wallet_watchAsset",
  "wallet_getCallsStatus",
  "wallet_getCapabilities",
  "wallet_getPermissions",
  "wallet_prepareAuthorization",
  "wallet_requestPermissions",
  "wallet_revokePermissions",
  "wallet_sendCalls",
  "wallet_signAuthorization",
  "wallet_signEip7702Authorization",
  "personal_sign",
] as const;

const KNOWN_SET = new Set<string>(KNOWN_CAPABILITIES);

const PREFIX_ORDER = ["eth_", "wallet_", "personal_"] as const;

function prefixRank(prefix: string): number {
  const index = PREFIX_ORDER.indexOf(prefix as (typeof PREFIX_ORDER)[number]);

  return index === -1 ? PREFIX_ORDER.length : index;
}

export type CapabilityRow = {
  id: string;
  granted: boolean;
};

export type CapabilityGroup = {
  prefix: string;
  items: CapabilityRow[];
};

function capabilityPrefix(id: string): string {
  for (const prefix of PREFIX_ORDER) {
    if (id.startsWith(prefix)) return prefix;
  }
  const colon = id.indexOf(":");

  if (colon > 0) return `${id.slice(0, colon + 1)}`;

  const underscore = id.indexOf("_");

  if (underscore > 0) return `${id.slice(0, underscore + 1)}`;

  return "other";
}

export function extractGrantedCapabilities(
  permissions: WalletPermissionLike[],
): Set<string> {
  const granted = new Set<string>();

  for (const permission of permissions) {
    granted.add(permission.parentCapability);

    for (const caveat of permission.caveats ?? []) {
      if (caveat.type !== "requiredMethods") continue;

      const methods = Array.isArray(caveat.value)
        ? caveat.value
        : [caveat.value];

      for (const method of methods) {
        if (typeof method === "string") granted.add(method);
      }
    }
  }

  return granted;
}

export function buildCapabilityGroups(granted: Set<string>): CapabilityGroup[] {
  const extras = [...granted].filter(id => !KNOWN_SET.has(id)).sort();
  const allIds = [...KNOWN_CAPABILITIES, ...extras];

  const byPrefix = new Map<string, CapabilityRow[]>();

  for (const id of allIds) {
    const prefix = capabilityPrefix(id);
    const items = byPrefix.get(prefix) ?? [];

    items.push({ id, granted: granted.has(id) });
    byPrefix.set(prefix, items);
  }

  return [...byPrefix.entries()]
    .sort(([a], [b]) => prefixRank(a) - prefixRank(b) || a.localeCompare(b))
    .map(([prefix, items]) => ({ prefix, items }));
}

export function normalizePermissionsResponse(raw: unknown): WalletPermissionLike[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(isPermissionLike);
  }

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;

    if ("caveats" in obj || "parentCapability" in obj) {
      return isPermissionLike(obj) ? [obj] : [];
    }

    return Object.keys(obj).map(key => ({
      parentCapability: key,
      caveats: [],
      ...(typeof obj[key] === "object" && obj[key] !== null
        ? (obj[key] as Record<string, unknown>)
        : {}),
    }));
  }

  return [];
}

function isPermissionLike(value: unknown): value is WalletPermissionLike {
  return (
    typeof value === "object"
    && value !== null
    && "parentCapability" in value
    && typeof (value as WalletPermissionLike).parentCapability === "string"
  );
}
