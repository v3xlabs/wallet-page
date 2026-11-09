"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

import { ProviderList } from "./ProviderList";
import { useWallet } from "./WalletProvider";

type WalletPickerModalProperties = {
  open: boolean;
  onClose: () => void;
};

export const WalletPickerModal = ({ open, onClose }: WalletPickerModalProperties) => {
  const dialogReference = useRef<HTMLDialogElement>(null);
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
    const dialog = dialogReference.current;

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
      ref={dialogReference}
      aria-labelledby="wallet-picker-title"
      className="demo-dialog fixed inset-0 m-auto h-fit max-h-[min(90vh,calc(100dvh-2rem))] w-[min(24rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-xl border border-primary bg-surface p-0 text-primary shadow-overlay backdrop:bg-black/45 max-md:mb-0 max-md:w-full max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:pb-[env(safe-area-inset-bottom)]"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogReference.current) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 pt-3 pr-3 pb-1 pl-5">
        <h3 id="wallet-picker-title" className="m-0 text-lg font-semibold tracking-tight text-heading">Choose a wallet</h3>
        <button
          type="button"
          className="demo-icon-btn rounded-full border-transparent bg-surfaceTint"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden className="size-4" />
        </button>
      </div>
      <p className="m-0 px-5 pb-3 text-sm text-secondary">
        Wallets discovered via EIP-6963. Your choice applies to every demo on
        this site until you disconnect.
      </p>
      {connectError && (
        <p className="mx-5 mb-3 rounded-md bg-destructive-tint px-3 py-2 text-sm text-primary" role="alert">
          {connectError}
        </p>
      )}
      <div className="px-3 pb-3">
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
      </div>
      <div className="border-t border-primary px-5 py-3">
        <button
          type="button"
          className="demo-btn"
          onClick={() => requestProviders()}
        >
          Request providers again
        </button>
      </div>
    </dialog>
  );

  if (!portalTarget) return null;

  return createPortal(pickerDialog, portalTarget);
};
