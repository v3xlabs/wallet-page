"use client";

import { useState } from "react";

import { WalletPickerModal } from "./WalletPickerModal";
import { useWallet } from "./WalletProvider";

/** One connect gate + badge per MDX page that has multiple inline demos. */
export function PageDemoChrome() {
  const { session } = useWallet();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!session) {
    return (
      <div className="wallet-demo wallet-demo-page-chrome">
        <div className="wallet-demo-panel wallet-demo-panel-gate">
          <p className="wallet-demo-lead">
            Pick a wallet to run the tests below. Connection is shared across
            this site.
          </p>
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            onClick={() => setPickerOpen(true)}
          >
            Choose wallet
          </button>
          <WalletPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      </div>
    );
  }

  return null;
}
