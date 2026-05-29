"use client";

import { useState, type ReactNode } from "react";

import { WalletBadge } from "./WalletBadge";
import { WalletPickerModal } from "./WalletPickerModal";
import { useWallet } from "./WalletProvider";

export function DemoShell({ children }: { children: ReactNode }) {
  const { session } = useWallet();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!session) {
    return (
      <div className="wallet-demo">
        <div className="wallet-demo-panel wallet-demo-panel-gate">
          <p className="wallet-demo-lead">
            Pick a wallet to run this test. Connection is shared across all demo
            pages.
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

  return (
    <div className="wallet-demo">
      <div className="wallet-demo-panel wallet-demo-panel-connected">
        <WalletBadge />
        {children}
      </div>
    </div>
  );
}
