"use client";

import { FiCode } from "react-icons/fi";

import { sourceUrl } from "../../lib/repo";
import { WalletBadge } from "./WalletBadge";
import { useWallet } from "./WalletProvider";

/** Frame header: connected session or connect control, then the source link. */
export const WalletDemoChrome = ({ source }: { source?: string; }) => {
  const { session, openConnect, connecting } = useWallet();

  return (
    <div className="demo-bar justify-between border-b border-primary">
      {session
        ? <WalletBadge />
        : (
            <button
              type="button"
              className="demo-btn disabled:cursor-wait"
              onClick={openConnect}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect wallet"}
            </button>
          )}
      {source && (
        <a
          className="demo-icon-btn no-underline"
          href={sourceUrl(source)}
          target="_blank"
          rel="noreferrer"
          title="View demo source on GitHub"
          aria-label="View demo source on GitHub"
        >
          <FiCode aria-hidden className="size-4" />
        </a>
      )}
    </div>
  );
};
