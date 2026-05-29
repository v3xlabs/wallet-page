"use client";

import { useState, type ReactNode } from "react";

import { DemoInspector, type DemoInspectorProps } from "./DemoInspector";

type MiniDemoProps = {
  title: string;
  description?: ReactNode;
  inspector?: DemoInspectorProps;
  actionLabel: string;
  onAction: () => void | Promise<void>;
  result?: string;
  error?: string;
  pending?: boolean;
  idleHint?: string;
};

/** Compact inline demo with tabbed inspector. */
export function MiniDemo({
  title,
  description,
  inspector,
  actionLabel,
  onAction,
  result,
  error,
  pending,
  idleHint,
}: MiniDemoProps) {
  const [localPending, setLocalPending] = useState(false);

  const run = async () => {
    setLocalPending(true);
    try {
      await onAction();
    }
    finally {
      setLocalPending(false);
    }
  };

  const busy = pending ?? localPending;

  return (
    <div className="wallet-mini-demo">
      <h4 className="wallet-mini-demo-title">{title}</h4>
      {description && (
        <div className="wallet-demo-muted wallet-mini-demo-desc">{description}</div>
      )}
      {inspector && <DemoInspector {...inspector} />}
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
      {error && (
        <pre className="wallet-mini-demo-output wallet-mini-demo-error">{error}</pre>
      )}
      {result && !error && (
        <pre className="wallet-mini-demo-output">{result}</pre>
      )}
      {!busy && !result && !error && idleHint && (
        <p className="wallet-demo-muted wallet-mini-demo-idle">{idleHint}</p>
      )}
    </div>
  );
}
