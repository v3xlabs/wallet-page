"use client";

import { sourceUrl } from "../../../lib/repo";
import { ProviderList } from "../../wallet/ProviderList";
import { WalletBadge } from "../../wallet/WalletBadge";
import { useWallet } from "../../wallet/WalletProvider";

const SOURCE = "components/demos/connect/connect-wallet-demo.tsx";

/** Connect + EIP-6963 discovery on one panel — wallet list is always visible. */
export function ConnectWalletDemo() {
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
    <div className="wallet-demo">
      <div className="wallet-demo-panel wallet-demo-panel-discovery">
        <div className="wallet-demo-chrome">
          <a
            className="wallet-demo-source"
            href={sourceUrl(SOURCE)}
            target="_blank"
            rel="noreferrer"
            title="View demo source on GitHub"
            aria-label="View demo source on GitHub"
          >
            {"</>"}
          </a>
          {session && <WalletBadge />}
        </div>

        <section className="wallet-demo-section">
          <h3>Connect</h3>
          <p className="wallet-demo-muted">
            Choose a provider from the list below.
          </p>
          {connectError && (
            <p className="wallet-demo-error" role="alert">
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

        <section className="wallet-demo-section">
          <div className="wallet-demo-actions">
            <button
              type="button"
              className="wallet-demo-btn wallet-demo-btn-primary"
              onClick={() => requestProviders()}
            >
              Request providers
            </button>
          </div>
          <details className="wallet-demo-details">
            <summary>
              Announce payloads (
              {infoPayload.length}
              )
            </summary>
            <pre className="wallet-demo-log">
              {infoPayload.length === 0
                ? "[]"
                : JSON.stringify(infoPayload, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </div>
  );
}
