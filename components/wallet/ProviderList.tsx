"use client";

import type { Eip6963ProviderDetail } from "../../lib/ethereum";

type ProviderListProperties = {
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
}: ProviderListProperties) => {
  if (providers.length === 0) {
    return <p className="m-0 px-2 py-3 text-control text-secondary">{emptyMessage}</p>;
  }

  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {providers.map(detail => (
        <li key={detail.info.uuid} className="m-0">
          <button
            type="button"
            className="flex h-16 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left transition-[background-color,transform] duration-150 ease-out enabled:hover:bg-surfaceTint enabled:active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            disabled={connecting}
            onClick={() => onSelect(detail)}
          >
            <img src={detail.info.icon} alt="" width={36} height={36} className="size-9 shrink-0 rounded-lg" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-base font-medium text-heading">{detail.info.name}</span>
              <span className="truncate text-control text-secondary">{detail.info.rdns}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
