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
      className="fixed inset-0 m-auto h-fit max-h-[min(90vh,calc(100dvh-2rem))] w-fit max-w-[min(28rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-black/45"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="rounded-lg border border-primary bg-code-block px-5 py-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-base">Choose a wallet</h3>
          <button
            type="button"
            className="cursor-pointer px-1 text-[1.1rem] leading-none text-secondary hover:text-primary"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-secondary">
          Wallets discovered via EIP-6963. Your choice applies to every demo on
          this site until you disconnect.
        </p>
        {connectError && (
          <p className="mb-4 rounded-md bg-destructive-tint px-4 py-3 text-sm text-primary" role="alert">
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
        <div className="my-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="demo-btn"
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
