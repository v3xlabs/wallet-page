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
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            onClick={() => setPickerOpen(true)}
          >
            Connect Wallet
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
