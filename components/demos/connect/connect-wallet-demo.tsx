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
      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-sm font-semibold">Connect</h3>
        <p className="m-0 text-sm text-secondary">
          Choose a provider from the list below.
        </p>
        {connectError && (
          <p className="m-0 rounded-md bg-destructive-tint px-3 py-2 text-sm text-primary" role="alert">
            {connectError}
          </p>
        )}
        <ProviderList
          providers={providers}
          connecting={connecting}
          onSelect={detail => void connectDetail(detail)}
          emptyMessage="No providers yet -- install a wallet extension and use Request providers below."
        />
        <details className="text-control text-secondary">
          <summary className="cursor-pointer">
            Announce payloads (
            {infoPayload.length}
            )
          </summary>
          <pre className="demo-scroll-x m-0 pt-3 pb-1 font-mono text-control whitespace-pre text-primary">
            {infoPayload.length === 0
              ? "[]"
              : JSON.stringify(infoPayload, null, 2)}
          </pre>
        </details>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="demo-btn demo-btn-primary"
            onClick={() => requestProviders()}
          >
            Request providers
          </button>
        </div>
      </div>
    </DemoFrame>
  );
};
