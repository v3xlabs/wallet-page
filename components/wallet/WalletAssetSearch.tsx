"use client";

import { useId, useMemo, useState } from "react";

import {
  filterWalletAssets,
  type WalletAssetRow,
} from "../../lib/walletAssets";

type WalletAssetSearchProps = {
  assets: WalletAssetRow[];
  loading?: boolean;
  placeholder?: string;
};

/** Filterable asset list (Kobalte Search–style UX for React). */
export function WalletAssetSearch({
  assets,
  loading,
  placeholder = "Search tokens by name, symbol, or address…",
}: WalletAssetSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterWalletAssets(assets, query),
    [assets, query],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-secondary" htmlFor={`${listId}-input`}>
        Assets in wallet
      </label>
      <div className="flex">
        <input
          id={`${listId}-input`}
          type="search"
          className="demo-input"
          role="combobox"
          aria-expanded={filtered.length > 0}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
          placeholder={placeholder}
          value={query}
          onChange={event => setQuery(event.target.value)}
          disabled={loading || assets.length === 0}
        />
      </div>

      <div
        id={`${listId}-listbox`}
        role="listbox"
        aria-label="Wallet assets"
        className="max-h-64 overflow-y-auto rounded-lg border border-primary bg-surfaceMuted"
      >
        {loading && (
          <p className="px-3.5 py-3 text-sm text-secondary">Loading assets…</p>
        )}
        {!loading && assets.length === 0 && (
          <p className="px-3.5 py-3 text-sm text-secondary">
            No assets yet — click Get assets to load.
          </p>
        )}
        {!loading && assets.length > 0 && filtered.length === 0 && (
          <p className="px-3.5 py-3 text-sm text-secondary">
            No assets match your search.
          </p>
        )}
        {!loading
        && filtered.map(asset => (
          <div
            key={asset.id}
            role="option"
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5 border-b border-primary px-3.5 py-2 last:border-b-0"
            aria-selected={false}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {asset.iconUrl && (
                <img
                  className="shrink-0 rounded-full object-cover"
                  src={asset.iconUrl}
                  alt=""
                  width={20}
                  height={20}
                />
              )}
              <span className="text-sm font-semibold">{asset.symbol}</span>
              {asset.name !== asset.symbol && (
                <span className="text-[13px] text-secondary">{asset.name}</span>
              )}
            </div>
            <div className="flex flex-wrap items-baseline gap-2 text-[13px] text-secondary">
              <span className="font-mono text-primary">{asset.balanceLabel}</span>
              <span className="lowercase">{asset.type}</span>
              <code className="font-mono text-xs">{asset.chainId}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
