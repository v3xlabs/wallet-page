"use client";

import classNames from "classnames";
import type { ReactNode } from "react";

import { mergeInspector } from "../../../lib/demoInspector";
import { DemoInspector, type DemoInspectorProps } from "../DemoInspector";

export type WalletAction = {
  label: string;
  onClick: () => void | Promise<void>;
  primary?: boolean;
  disabled?: boolean;
};

type WalletActionPanelProps = {
  inspector?: DemoInspectorProps;
  /** Shown on the Response tab (merged into inspector). */
  response?: unknown;
  error?: unknown;
  actions: WalletAction[];
  pending?: boolean;
  children?: ReactNode;
};

/** Tabbed inspector, right-aligned actions. */
export function WalletActionPanel({
  inspector,
  response,
  error,
  actions,
  pending,
  children,
}: WalletActionPanelProps) {
  const merged = mergeInspector(inspector, response, error);

  return (
    <div className="my-4 flex flex-col gap-2.5">
      {merged && <DemoInspector {...merged} />}
      <div className="flex flex-wrap justify-end gap-2">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            className={classNames("demo-btn", { "demo-btn-primary": action.primary })}
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
