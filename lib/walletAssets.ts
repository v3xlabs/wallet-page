import { formatUnits } from "viem";

export type WalletAssetRow = {
  id: string;
  chainId: string;
  address: string;
  type: string;
  symbol: string;
  name: string;
  balanceLabel: string;
  iconUrl?: string;
  searchText: string;
};

function shortenAddress(address: string): string {
  if (address === "native") return "native";

  if (address.length < 12) return address;

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function chainIdToLabel(chainId: unknown): string {
  if (typeof chainId === "number" && Number.isFinite(chainId)) {
    return `0x${chainId.toString(16)}`;
  }

  if (typeof chainId === "string") {
    if (chainId.startsWith("0x")) return chainId;

    if (/^\d+$/.test(chainId)) return `0x${Number(chainId).toString(16)}`;

    return chainId;
  }

  return "";
}

function readString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }

  return undefined;
}

function readDecimals(...sources: Record<string, unknown>[]): number | undefined {
  for (const source of sources) {
    const decimals = source.decimals;

    if (typeof decimals === "number") return decimals;

    if (typeof decimals === "string" && /^\d+$/.test(decimals)) {
      return Number(decimals);
    }
  }

  return undefined;
}

function formatHexBalance(balance: string, decimals?: number): string {
  if (typeof decimals === "number" && balance.startsWith("0x")) {
    try {
      return formatUnits(BigInt(balance), decimals);
    }
    catch {
      /* fall through */
    }
  }

  return balance;
}

function balanceLabelFromEntry(
  entry: Record<string, unknown>,
  decimals?: number,
): string {
  const display = readString(entry.displayBalance, entry.displayValue);

  if (display) return display;

  const balance = String(entry.balance ?? "0x0");

  return formatHexBalance(balance, decimals);
}

function labelsFromEntry(
  entry: Record<string, unknown>,
  address: string,
  type: string,
): { symbol: string; name: string; iconUrl?: string; } {
  const currencyInfo
    = entry.currencyInfo && typeof entry.currencyInfo === "object"
      ? (entry.currencyInfo as Record<string, unknown>)
      : undefined;
  const metadata
    = entry.metadata && typeof entry.metadata === "object"
      ? (entry.metadata as Record<string, unknown>)
      : undefined;
  const tokenInfo
    = entry.tokenInfo && typeof entry.tokenInfo === "object"
      ? (entry.tokenInfo as Record<string, unknown>)
      : undefined;

  const symbol = readString(
    entry.symbol,
    currencyInfo?.symbol,
    metadata?.symbol,
  );
  const name = readString(
    entry.name,
    currencyInfo?.name,
    metadata?.name,
    symbol,
  );
  const iconUrl = readString(entry.logoURI, entry.image, metadata?.image);

  if (symbol) {
    return {
      symbol,
      name: name ?? symbol,
      iconUrl,
    };
  }

  if (address === "native" || type === "native" || type === "nativeCurrency") {
    return { symbol: "Native", name: name ?? "Native asset", iconUrl };
  }

  const short = shortenAddress(address);

  return { symbol: short, name: name ?? short, iconUrl };
}

function pushRow(
  rows: WalletAssetRow[],
  seen: Set<string>,
  params: Omit<WalletAssetRow, "searchText">,
): void {
  let id = params.id;
  let suffix = 0;

  while (seen.has(id)) {
    suffix += 1;
    id = `${params.id}#${suffix}`;
  }
  seen.add(id);
  const searchText = [
    params.chainId,
    params.address,
    params.type,
    params.symbol,
    params.name,
    params.balanceLabel,
  ]
    .join(" ")
    .toLowerCase();

  rows.push({ ...params, id, searchText });
}

function parseErc7811ByChain(raw: Record<string, unknown>): WalletAssetRow[] {
  const rows: WalletAssetRow[] = [];
  const seen = new Set<string>();

  for (const [chainKey, value] of Object.entries(raw)) {
    if (!chainKey.startsWith("0x") || !Array.isArray(value)) continue;

    const chainId = chainIdToLabel(chainKey) || chainKey;

    for (const item of value) {
      if (!item || typeof item !== "object") continue;

      const entry = item as Record<string, unknown>;
      const address = String(entry.address ?? "native");
      const type = String(entry.type ?? "unknown").toLowerCase();
      const metadata
        = entry.metadata && typeof entry.metadata === "object"
          ? (entry.metadata as Record<string, unknown>)
          : undefined;
      const decimals = readDecimals(metadata ?? {});
      const { symbol, name, iconUrl } = labelsFromEntry(entry, address, type);
      const balanceLabel = balanceLabelFromEntry(entry, decimals);

      pushRow(rows, seen, {
        id: `${chainId}:${address.toLowerCase()}:${type}`,
        chainId,
        address,
        type,
        symbol,
        name,
        balanceLabel,
        iconUrl,
      });
    }
  }

  return rows;
}

function groupedTypeName(groupKey: string): string {
  if (groupKey === "nativeCurrency") return "native";

  return groupKey.toLowerCase();
}

function parseGroupedByAssetType(raw: Record<string, unknown>): WalletAssetRow[] {
  const rows: WalletAssetRow[] = [];
  const seen = new Set<string>();

  for (const [groupKey, value] of Object.entries(raw)) {
    if (groupKey.startsWith("0x") || !Array.isArray(value)) continue;

    const type = groupedTypeName(groupKey);

    for (const item of value) {
      if (!item || typeof item !== "object") continue;

      const entry = item as Record<string, unknown>;
      const chainId
        = chainIdToLabel(entry.chainId ?? entry.chain_id) || "unknown";
      const address = String(entry.address ?? "native");
      const currencyInfo
        = entry.currencyInfo && typeof entry.currencyInfo === "object"
          ? (entry.currencyInfo as Record<string, unknown>)
          : undefined;
      const decimals = readDecimals(entry, currencyInfo ?? {});
      const { symbol, name, iconUrl } = labelsFromEntry(entry, address, type);
      const balanceLabel = balanceLabelFromEntry(entry, decimals);

      pushRow(rows, seen, {
        id: `${type}:${chainId}:${address.toLowerCase()}`,
        chainId,
        address,
        type,
        symbol,
        name,
        balanceLabel,
        iconUrl,
      });
    }
  }

  return rows;
}

function isErc7811ByChain(raw: Record<string, unknown>): boolean {
  return Object.keys(raw).some(
    key => key.startsWith("0x") && Array.isArray(raw[key]),
  );
}

function isGroupedByAssetType(raw: Record<string, unknown>): boolean {
  return Object.entries(raw).some(
    ([key, value]) => !key.startsWith("0x") && Array.isArray(value),
  );
}

export function parseWalletGetAssetsResponse(raw: unknown): WalletAssetRow[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];

  const obj = raw as Record<string, unknown>;
  let rows: WalletAssetRow[] = [];

  if (isErc7811ByChain(obj)) {
    rows = parseErc7811ByChain(obj);
  }
  else if (isGroupedByAssetType(obj)) {
    rows = parseGroupedByAssetType(obj);
  }

  return rows.sort((a, b) => {
    const chain = a.chainId.localeCompare(b.chainId);

    if (chain !== 0) return chain;

    return a.symbol.localeCompare(b.symbol);
  });
}

export function filterWalletAssets(
  rows: WalletAssetRow[],
  query: string,
): WalletAssetRow[] {
  const q = query.trim().toLowerCase();

  if (!q) return rows;

  return rows.filter(row => row.searchText.includes(q));
}
