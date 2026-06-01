"use client";

import { sourceUrl } from "../../lib/repo";
import { WalletBadge } from "./WalletBadge";
import { useWallet } from "./WalletProvider";

/** Top-right demo chrome: source link + connected session badge or connect control. */
export function WalletDemoChrome({ source }: { source?: string; }) {
  const { session, openConnect, connecting } = useWallet();

  return (
    <div className="wallet-demo-chrome">
      {source && (
        <a
          className="wallet-demo-source"
          href={sourceUrl(source)}
          target="_blank"
          rel="noreferrer"
          title="View demo source on GitHub"
          aria-label="View demo source on GitHub"
        >
          {"</>"}
        </a>
      )}
      {session
        ? (
            <WalletBadge />
          )
        : (
            <button
              type="button"
              className="wallet-demo-badge wallet-demo-badge-connect"
              onClick={openConnect}
              disabled={connecting}
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          )}
    </div>
  );
}
