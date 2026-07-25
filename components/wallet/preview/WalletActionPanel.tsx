"use client";

import classNames from "classnames";
import type { ReactNode } from "react";

import { mergeInspector } from "../../../lib/demoInspector";
import { DemoInspector, type DemoInspectorProps as DemoInspectorProperties } from "../DemoInspector";

export type WalletAction = {
  label: string;
  onClick: () => void | Promise<void>;
  primary?: boolean;
  disabled?: boolean;
};

type WalletActionPanelProperties = {
  inspector?: DemoInspectorProperties;
  /** Shown on the Response tab (merged into inspector). */
  response?: unknown;
  error?: unknown;
  actions: WalletAction[];
  pending?: boolean;
  children?: ReactNode;
};

/** Tabbed inspector, right-aligned actions. */
export const WalletActionPanel = ({
  inspector,
  response,
  error,
  actions,
  pending,
  children,
}: WalletActionPanelProperties) => {
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
};
