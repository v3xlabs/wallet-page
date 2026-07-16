"use client";

import { FiCode } from "react-icons/fi";

import { sourceUrl } from "../../../lib/repo";
import { ProviderList } from "../../wallet/ProviderList";
import { WalletBadge } from "../../wallet/WalletBadge";
import { useWallet } from "../../wallet/WalletProvider";

const SOURCE = "components/demos/connect/connect-wallet-demo.tsx";

/** Connect + EIP-6963 discovery on one panel — wallet list is always visible. */
export const ConnectWalletDemo = () => {
  const {
    providers,
    connecting,
    connectError,
    connectDetail,
    requestProviders,
    session,
  } = useWallet();

  const infoPayload = providers.map(p => p.info);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-primary">
      <div className="relative bg-code-block px-5 pt-10 pb-4">
        <div className="absolute top-3 right-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2">
          <a
            className="inline-flex items-center rounded-full border border-primary px-1.5 py-1 font-mono text-xs leading-none text-secondary no-underline hover:border-secondary hover:bg-surfaceMuted hover:text-primary"
            href={sourceUrl(SOURCE)}
            target="_blank"
            rel="noreferrer"
            title="View demo source on GitHub"
            aria-label="View demo source on GitHub"
          >
            <FiCode />
          </a>
          {session && <WalletBadge />}
        </div>

        <section className="mt-5 first:mt-0">
          <h3 className="mb-2 text-base">Connect</h3>
          <p className="text-sm text-secondary">
            Choose a provider from the list below.
          </p>
          {connectError && (
            <p className="mb-4 rounded-md bg-destructive-tint px-4 py-3 text-sm text-primary" role="alert">
              {connectError}
            </p>
          )}
          <ProviderList
            providers={providers}
            connecting={connecting}
            onSelect={detail => void connectDetail(detail)}
            emptyMessage="No providers yet — install a wallet extension and use Request providers below."
          />
        </section>

        <section className="mt-5 first:mt-0">
          <div className="my-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="demo-btn demo-btn-primary"
              onClick={() => requestProviders()}
            >
              Request providers
            </button>
          </div>
          <details className="mt-4 text-sm">
            <summary>
              Announce payloads (
              {infoPayload.length}
              )
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-primary bg-surfaceMuted p-3 font-mono text-xs whitespace-pre-wrap wrap-break-word">
              {infoPayload.length === 0
                ? "[]"
                : JSON.stringify(infoPayload, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </div>
  );
};
