"use client";

import { useId, useMemo, useState } from "react";

import {
  filterWalletAssets,
  type WalletAssetRow,
} from "../../lib/walletAssets";

type WalletAssetSearchProperties = {
  assets: WalletAssetRow[];
  loading?: boolean;
  placeholder?: string;
};

/** Filterable asset list (Kobalte Search-style UX for React). */
export const WalletAssetSearch = ({
  assets,
  loading,
  placeholder = "Search assets by name, symbol, or address...",
}: WalletAssetSearchProperties) => {
  const listId = useId();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterWalletAssets(assets, query),
    [assets, query],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-control text-secondary" htmlFor={`${listId}-input`}>
        Assets in wallet
      </label>
      <div className="flex">
        <input
          id={`${listId}-input`}
          type="search"
          className="demo-input h-8 py-0"
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
        className="flex max-h-64 flex-col gap-2 overflow-y-auto"
      >
        {loading && (
          <p className="text-control text-secondary">Loading assets...</p>
        )}
        {!loading && assets.length === 0 && (
          <p className="text-control text-secondary">
            No assets yet -- click Get assets to load.
          </p>
        )}
        {!loading && assets.length > 0 && filtered.length === 0 && (
          <p className="text-control text-secondary">
            No assets match your search.
          </p>
        )}
        {!loading
          && filtered.map(asset => (
            <div
              key={asset.id}
              role="option"
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
              aria-selected={false}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                  <span className="text-control text-secondary">{asset.name}</span>
                )}
              </div>
              <div className="flex flex-wrap items-baseline gap-2 text-control text-secondary">
                <span className="font-mono text-primary">{asset.balanceLabel}</span>
                <span className="lowercase">{asset.type}</span>
                <span className="font-mono text-control">{asset.chainId}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
