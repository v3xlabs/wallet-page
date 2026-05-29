/** Decode helpers for [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255) permission objects. */

export type WalletPermissionLike = {
  parentCapability: string;
  invoker?: string;
  id?: string;
  date?: number;
  caveats?: { type: string; value: unknown }[];
};

export type DecodedCaveat = {
  type: string;
  summary: string;
  rawValue: string;
};

export type DecodedPermission = {
  parentCapability: string;
  title: string;
  summary: string;
  specUrl?: string;
  invoker?: string;
  grantedAt?: string;
  caveats: DecodedCaveat[];
};

const CAPABILITY_DOCS: Record<
  string,
  { title: string; summary: string; specUrl?: string }
> = {
  eth_accounts: {
    title: "Account access",
    summary:
      "Allows this site to see one or more of your addresses and call methods that depend on them (for example eth_accounts). Usually shown as “Connect wallet”.",
    specUrl: "https://eips.ethereum.org/EIPS/eip-1193",
  },
  "endowment:permitted-chains": {
    title: "Permitted chains (MetaMask)",
    summary:
      "Restricts which chain IDs the site may use with wallet_switchEthereumChain / wallet_addEthereumChain.",
    specUrl:
      "https://docs.metamask.io/wallet/concepts/wallet-permissions/#endowmentpermitted-chains",
  },
  "endowment:network-controller": {
    title: "Network controller (MetaMask)",
    summary:
      "Allows the site to read or influence network configuration exposed by the wallet.",
    specUrl:
      "https://docs.metamask.io/wallet/concepts/wallet-permissions/#endowmentnetwork-controller",
  },
  "endowment:rpc-provider": {
    title: "RPC provider (MetaMask)",
    summary: "Grants access to JSON-RPC methods through the wallet provider.",
    specUrl:
      "https://docs.metamask.io/wallet/concepts/wallet-permissions/#endowmentrpc-provider",
  },
};

const CAVEAT_DOCS: Record<string, (value: unknown) => string> = {
  filterResponse: (value) => {
    const list = Array.isArray(value) ? value : [value];
    return `Only these account addresses may be exposed to the site: ${list.join(", ")}.`;
  },
  requiredMethods: (value) => {
    const list = Array.isArray(value) ? value.join(", ") : String(value);
    return `Site asked for accounts that also support: ${list}.`;
  },
  restrictReturnedAccounts: (value) => {
    const list = Array.isArray(value) ? value.join(", ") : String(value);
    return `Returned accounts are limited to: ${list}.`;
  },
  forceParams: () =>
    "RPC calls for this capability must use fixed parameters defined by the wallet.",
  limitResponseLength: (value) =>
    `Response size is capped (max ${String(value)} items).`,
  requireParamsIsSubset: () =>
    "RPC parameters must stay within bounds set when the permission was granted.",
  requireParamsIsSuperset: () =>
    "RPC parameters must include required fields set when the permission was granted.",
};

function stringifyValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  }
  catch {
    return String(value);
  }
}

export function decodeCaveat(type: string, value: unknown): DecodedCaveat {
  const explain = CAVEAT_DOCS[type];
  return {
    type,
    summary: explain
      ? explain(value)
      : `Wallet-specific restriction (${type}). See raw value.`,
    rawValue: stringifyValue(value),
  };
}

export function decodePermission(permission: WalletPermissionLike): DecodedPermission {
  const known = CAPABILITY_DOCS[permission.parentCapability];
  const caveats = (permission.caveats ?? []).map((c) =>
    decodeCaveat(c.type, c.value),
  );

  let summary = known?.summary ?? "";
  if (!summary) {
    summary =
      permission.parentCapability.startsWith("endowment:")
        ? "Wallet-specific capability (often MetaMask endowment). Check your wallet’s permission docs."
        : `Permission to use the “${permission.parentCapability}” capability on this origin.`;
  }

  if (caveats.length > 0 && known?.title === "Account access") {
    summary +=
      " Caveats below further limit what the site can see or do.";
  }

  return {
    parentCapability: permission.parentCapability,
    title: known?.title ?? permission.parentCapability,
    summary,
    specUrl: known?.specUrl,
    invoker: permission.invoker,
    grantedAt:
      permission.date !== undefined
        ? new Date(permission.date).toLocaleString()
        : undefined,
    caveats,
  };
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
    return Object.keys(obj).map((key) => ({
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

export type PermissionRequestPreset = {
  id: string;
  label: string;
  description: string;
  params: Record<string, Record<string, unknown>>;
};

export const PERMISSION_REQUEST_PRESETS: PermissionRequestPreset[] = [
  {
    id: "eth_accounts",
    label: "Request account access",
    description:
      "Standard connect flow — equivalent to approving eth_accounts for this origin.",
    params: { eth_accounts: {} },
  },
  {
    id: "eth_accounts_typed_data",
    label: "Accounts + typed data",
    description:
      "EIP-2255 example: ask for accounts that support eth_signTypedData_v4 (wallet may ignore unsupported caveats).",
    params: {
      eth_accounts: {
        requiredMethods: ["eth_signTypedData_v4"],
      },
    },
  },
];
