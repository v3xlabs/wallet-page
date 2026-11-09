"use client";

import { DemoFrame } from "../../wallet/DemoFrame";
import { ProviderList } from "../../wallet/ProviderList";
import { useWallet } from "../../wallet/WalletProvider";

const SOURCE = "components/demos/connect/connect-wallet-demo.tsx";

/** Connect + EIP-6963 discovery on one panel -- wallet list is always visible. */
export const ConnectWalletDemo = () => {
  const {
    providers,
    connecting,
    connectError,
    connectDetail,
    requestProviders,
  } = useWallet();

  const infoPayload = providers.map(p => p.info);

  return (
    <DemoFrame source={SOURCE}>
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
          emptyMessage="No providers yet -- install a wallet extension and use Request providers below."
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
    </DemoFrame>
  );
};
