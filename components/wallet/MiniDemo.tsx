"use client";

import { type ReactNode, useState } from "react";

import { mergeInspector } from "../../lib/demoInspector";
import { DemoFrame } from "./DemoFrame";
import { DemoInspector, type DemoInspectorProps } from "./DemoInspector";
import { useWallet } from "./WalletProvider";

type MiniDemoProps = {
  title: string;
  description?: ReactNode;
  inspector?: DemoInspectorProps;
  actionLabel: string;
  onAction: () => void | Promise<void>;
  response?: string;
  error?: string;
  pending?: boolean;
  /** Repo-relative path to the demo's source file. */
  source?: string;
};

function MiniDemoContent({
  title,
  description,
  inspector,
  actionLabel,
  onAction,
  response,
  error,
  pending,
}: Omit<MiniDemoProps, "source">) {
  const { requireSession } = useWallet();
  const [localPending, setLocalPending] = useState(false);

  const run = async () => {
    if (!requireSession()) return;

    setLocalPending(true);

    try {
      await onAction();
    }
    finally {
      setLocalPending(false);
    }
  };

  const busy = pending ?? localPending;
  const merged = mergeInspector(inspector, response, error);

  return (
    <>
      <h4 className="wallet-mini-demo-title">{title}</h4>
      {description && (
        <div className="wallet-demo-muted wallet-mini-demo-desc">{description}</div>
      )}
      {merged && <DemoInspector {...merged} />}
      <div className="wallet-action-footer">
        <button
          type="button"
          className="wallet-demo-btn wallet-demo-btn-primary"
          disabled={busy}
          onClick={() => void run()}
        >
          {actionLabel}
        </button>
      </div>
    </>
  );
}

/** Compact RPC demo: Preview / Request / Response tabs + primary action. */
export function MiniDemo({ source, ...props }: MiniDemoProps) {
  return (
    <DemoFrame variant="mini" source={source}>
      <MiniDemoContent {...props} />
    </DemoFrame>
  );
}
