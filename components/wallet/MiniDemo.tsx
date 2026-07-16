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

const MiniDemoContent = ({
  title,
  description,
  inspector,
  actionLabel,
  onAction,
  response,
  error,
  pending,
}: Omit<MiniDemoProps, "source">) => {
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
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      {description && (
        <div className="mt-2 text-sm text-secondary">{description}</div>
      )}
      {merged && <DemoInspector {...merged} />}
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="demo-btn demo-btn-primary"
          disabled={busy}
          onClick={() => void run()}
        >
          {actionLabel}
        </button>
      </div>
    </>
  );
};

/** Compact RPC demo: Preview / Request / Response tabs + primary action. */
export const MiniDemo = ({ source, ...props }: MiniDemoProps) => (
  <DemoFrame variant="mini" source={source}>
    <MiniDemoContent {...props} />
  </DemoFrame>
);
