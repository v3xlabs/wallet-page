"use client";

import { FiCode } from "react-icons/fi";

import { sourceUrl } from "../../lib/repo";
import { WalletBadge } from "./WalletBadge";
import { useWallet } from "./WalletProvider";

/** Top-right demo chrome: source link + connected session badge or connect control. */
export function WalletDemoChrome({ source }: { source?: string; }) {
  const { session, openConnect, connecting } = useWallet();

  return (
    <div className="absolute top-3 right-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2">
      {source && (
        <a
          className="inline-flex items-center rounded-full border border-primary p-[0.35rem] font-mono text-xs leading-none text-secondary no-underline hover:border-(--vocs-text-color-secondary) hover:bg-surfaceMuted hover:text-primary"
          href={sourceUrl(source)}
          target="_blank"
          rel="noreferrer"
          title="View demo source on GitHub"
          aria-label="View demo source on GitHub"
        >
          <FiCode />
        </a>
      )}
      {session
        ? (
            <WalletBadge />
          )
        : (
            <button
              type="button"
              className="cursor-pointer rounded-full border border-primary bg-surfaceMuted px-2 py-1 text-xs text-primary enabled:hover:border-(--vocs-text-color-secondary) enabled:hover:bg-code-block disabled:cursor-wait disabled:opacity-70"
              onClick={openConnect}
              disabled={connecting}
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          )}
    </div>
  );
}
