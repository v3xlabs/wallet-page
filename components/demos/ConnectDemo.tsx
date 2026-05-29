"use client";

import { ProviderList } from "../wallet/ProviderList";
import { WalletBadge } from "../wallet/WalletBadge";
import { useWallet } from "../wallet/WalletProvider";

export function ConnectDemo() {
  const {
    providers,
    discoveryLog,
    connecting,
    connectError,
    connectDetail,
    requestProviders,
    session,
  } = useWallet();

  return (
    <div className="wallet-demo">
      <div className="wallet-demo-panel wallet-demo-panel-discovery">
        {session && <WalletBadge />}

        <section className="wallet-demo-section">
          <h3>Connect a wallet</h3>
          <p className="wallet-demo-muted">
            Choose a wallet below — the same session is reused on every demo page.
            If nothing appears, install an extension and refresh, or click Request
            providers under EIP-6963 discovery.
          </p>
          {session ? (
            <p className="wallet-demo-muted">
              Connected as <strong>{session.label}</strong> — use Disconnect in the
              badge above to end the session.
            </p>
          ) : (
            <p className="wallet-demo-muted">
              Found <strong>{providers.length}</strong> wallet
              {providers.length === 1 ? "" : "s"} on this origin.
            </p>
          )}
          {connectError && (
            <p className="wallet-demo-error" role="alert">
              {connectError}
            </p>
          )}
          <ProviderList
            providers={providers}
            connecting={connecting}
            onSelect={(detail) => void connectDetail(detail)}
            emptyMessage="No wallets announced yet — install an extension or use Request providers below."
          />
        </section>

        <section className="wallet-demo-section">
          <h3>EIP-6963 discovery</h3>
          <p className="wallet-demo-muted">
            Listening for <code>eip6963:announceProvider</code> on load. Dispatch{" "}
            <code>eip6963:requestProvider</code> again if a wallet was installed
            after the page opened.
          </p>
          <div className="wallet-demo-actions">
            <button
              type="button"
              className="wallet-demo-btn wallet-demo-btn-primary"
              onClick={() => requestProviders()}
            >
              Request providers
            </button>
          </div>
          <details className="wallet-demo-details" open>
            <summary>Discovery log ({discoveryLog.length})</summary>
            <pre className="wallet-demo-log">
              {discoveryLog.length === 0
                ? "Events will appear here…"
                : JSON.stringify(discoveryLog, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </div>
  );
}
