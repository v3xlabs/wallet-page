"use client";

import type { Eip6963ProviderDetail } from "../../lib/ethereum";

type ProviderListProps = {
  providers: Eip6963ProviderDetail[];
  connecting: boolean;
  onSelect: (detail: Eip6963ProviderDetail) => void;
  emptyMessage?: string;
};

export function ProviderList({
  providers,
  connecting,
  onSelect,
  emptyMessage = "No wallets announced yet. Install an extension and try again.",
}: ProviderListProps) {
  if (providers.length === 0) {
    return <p className="wallet-demo-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="wallet-demo-provider-list">
      {providers.map(detail => (
        <li key={detail.info.uuid}>
          <button
            type="button"
            className="wallet-demo-provider-btn"
            disabled={connecting}
            onClick={() => onSelect(detail)}
          >
            <img src={detail.info.icon} alt="" width={28} height={28} />
            <span>
              <strong>{detail.info.name}</strong>
              <span className="wallet-demo-muted">{detail.info.rdns}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
