"use client";

import type { Eip6963ProviderDetail } from "../../lib/ethereum";

type ProviderListProps = {
  providers: Eip6963ProviderDetail[];
  connecting: boolean;
  onSelect: (detail: Eip6963ProviderDetail) => void;
  emptyMessage?: string;
};

export const ProviderList = ({
  providers,
  connecting,
  onSelect,
  emptyMessage = "No wallets announced yet. Install an extension and try again.",
}: ProviderListProps) => {
  if (providers.length === 0) {
    return <p className="text-sm text-secondary">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-4 flex list-none flex-col gap-2 p-0">
      {providers.map(detail => (
        <li key={detail.info.uuid}>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-primary bg-surfaceMuted px-3.5 py-2.5 text-left text-primary enabled:hover:bg-code-highlighted"
            disabled={connecting}
            onClick={() => onSelect(detail)}
          >
            <img src={detail.info.icon} alt="" width={28} height={28} />
            <span className="flex flex-col gap-0.5">
              <strong>{detail.info.name}</strong>
              <span className="text-sm text-secondary">{detail.info.rdns}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
