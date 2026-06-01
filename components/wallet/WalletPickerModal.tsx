"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ProviderList } from "./ProviderList";
import { useWallet } from "./WalletProvider";

type WalletPickerModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WalletPickerModal({ open, onClose }: WalletPickerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const {
    providers,
    connecting,
    connectError,
    connectDetail,
    cancelPendingConnect,
    requestProviders,
  } = useWallet();

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    cancelPendingConnect();
  }, [open, cancelPendingConnect]);

  const pickerDialog = (
    <dialog
      ref={dialogRef}
      className="wallet-demo-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="wallet-demo-dialog-panel">
        <div className="wallet-demo-dialog-header">
          <h3>Choose a wallet</h3>
          <button
            type="button"
            className="wallet-demo-badge-disconnect"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="wallet-demo-muted">
          Wallets discovered via EIP-6963. Your choice applies to every demo on
          this site until you disconnect.
        </p>
        {connectError && (
          <p className="wallet-demo-error" role="alert">
            {connectError}
          </p>
        )}
        <ProviderList
          providers={providers}
          connecting={connecting}
          onSelect={(detail) => {
            onClose();
            const connect = () => void connectDetail(detail);

            if (detail.info.rdns === "company.v3x.openlv") {
              requestAnimationFrame(connect);
            }
            else {
              connect();
            }
          }}
        />
        <div className="wallet-demo-actions">
          <button
            type="button"
            className="wallet-demo-btn"
            onClick={() => requestProviders()}
          >
            Request providers again
          </button>
        </div>
      </div>
    </dialog>
  );

  if (!portalTarget) return null;

  return createPortal(pickerDialog, portalTarget);
}
