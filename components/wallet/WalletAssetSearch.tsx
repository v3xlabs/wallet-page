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
    <div className="wallet-asset-search">
      <label className="wallet-asset-search-label" htmlFor={`${listId}-input`}>
        Assets in wallet
      </label>
      <div className="wallet-asset-search-control">
        <input
          id={`${listId}-input`}
          type="search"
          className="wallet-asset-search-input"
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
        className="wallet-asset-search-list"
      >
        {loading && (
          <p className="wallet-demo-muted wallet-asset-search-hint">Loading assets…</p>
        )}
        {!loading && assets.length === 0 && (
          <p className="wallet-demo-muted wallet-asset-search-hint">
            No assets yet — click Get assets to load.
          </p>
        )}
        {!loading && assets.length > 0 && filtered.length === 0 && (
          <p className="wallet-demo-muted wallet-asset-search-hint">
            No assets match your search.
          </p>
        )}
        {!loading
        && filtered.map(asset => (
          <div
            key={asset.id}
            role="option"
            className="wallet-asset-search-item"
            aria-selected={false}
          >
            <div className="wallet-asset-search-item-main">
              {asset.iconUrl && (
                <img
                  className="wallet-asset-search-icon"
                  src={asset.iconUrl}
                  alt=""
                  width={20}
                  height={20}
                />
              )}
              <span className="wallet-asset-search-symbol">{asset.symbol}</span>
              {asset.name !== asset.symbol && (
                <span className="wallet-asset-search-name">{asset.name}</span>
              )}
            </div>
            <div className="wallet-asset-search-item-meta">
              <span className="wallet-asset-search-balance">{asset.balanceLabel}</span>
              <span className="wallet-asset-search-type">{asset.type}</span>
              <code className="wallet-asset-search-chain">{asset.chainId}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
