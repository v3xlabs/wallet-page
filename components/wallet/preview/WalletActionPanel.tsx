"use client";

import type { ReactNode } from "react";

import { DemoInspector, type DemoInspectorProps } from "../DemoInspector";

export type WalletAction = {
  label: string;
  onClick: () => void | Promise<void>;
  primary?: boolean;
  disabled?: boolean;
};

type WalletActionPanelProps = {
  inspector?: DemoInspectorProps;
  actions: WalletAction[];
  pending?: boolean;
  children?: ReactNode;
};

/** Tabbed inspector, right-aligned actions, optional results below. */
export function WalletActionPanel({
  inspector,
  actions,
  pending,
  children,
}: WalletActionPanelProps) {
  return (
    <div className="wallet-action-panel">
      {inspector && <DemoInspector {...inspector} />}
      <div className="wallet-action-footer">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`wallet-demo-btn${action.primary ? " wallet-demo-btn-primary" : ""}`}
            disabled={pending || action.disabled}
            onClick={() => void action.onClick()}
          >
            {action.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
