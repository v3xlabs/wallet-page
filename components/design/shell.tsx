"use client";

import classNames from "classnames";
import type { PropsWithChildren, ReactNode } from "react";
import { FiCode } from "react-icons/fi";

import { sourceUrl } from "../../lib/repo";
import { I18nControls } from "./locale";

/**
 * A footer control for a demo. Scenario switching reads best as `tabs`;
 * demo-specific settings (truncation style, ...) read best as a labelled
 * `select`. Locale and display currency are not controls - they are the
 * shared i18n cluster, enabled with the `i18n` prop.
 */
export type ShellControl
  = | {
    type: "tabs";
    options: readonly { value: string; label: string; }[];
    value: string;
    onChange: (value: string) => void;
  }
  | {
    type: "select";
    label: ReactNode;
    options: readonly { value: string; label: string; }[];
    value: string;
    onChange: (value: string) => void;
  };

const TabsControl = ({ control, name }: { control: ShellControl & { type: "tabs"; }; name: string; }) => (
  <div className="flex flex-wrap items-center gap-1 max-md:max-w-full max-md:flex-nowrap max-md:overflow-x-auto" role="tablist" aria-label={name}>
    {control.options.map(option => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={option.value === control.value}
        onClick={() => control.onChange(option.value)}
        className={classNames(
          "flex h-8 shrink-0 cursor-pointer items-center rounded-md px-2.5 text-control font-medium whitespace-nowrap transition-colors duration-150 max-md:px-2",
          option.value === control.value
            ? "bg-accenta2 text-accent"
            : "text-secondary hover:bg-surfaceTint hover:text-heading",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const SelectControl = ({ control }: { control: ShellControl & { type: "select"; }; }) => (
  <label className="flex items-center gap-2 text-xs text-muted">
    {control.label}
    <span className="relative">
      <select
        value={control.value}
        onChange={e => control.onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-primary bg-surface py-1 pr-7 pl-2 text-xs text-primary outline-none transition-colors hover:bg-surfaceMuted"
      >
        {control.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </label>
);

/**
 * Frame around every design demo. Pass `controls` - a named map of footer
 * controls - to give a demo scenario tabs, setting dropdowns, and whatever
 * comes next, all in the footer of the box: tabs sit left, selects right.
 */
export const DemoShell = ({
  children,
  source,
  controls,
  i18n,
}: PropsWithChildren<{
  source?: string;
  controls?: Record<string, ShellControl>;
  /** Show the shared locale/display-currency cluster in the footer. */
  i18n?: boolean;
}>) => {
  const entries = Object.entries(controls ?? {});
  const tabs = entries.filter(entry => entry[1].type === "tabs");
  const selects = entries.filter(entry => entry[1].type === "select");

  return (
    <div className="demo-frame relative">
      <div className="px-5 py-4 max-md:px-4">
        {children}
      </div>
      {(entries.length > 0 || i18n || source) && (
        <div className="demo-bar flex-wrap gap-x-3 border-t border-primary pl-3">
          {tabs.map(([name, control]) => (
            control.type === "tabs" && <TabsControl key={name} name={name} control={control} />
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {selects.map(([name, control]) => (
              control.type === "select" && <SelectControl key={name} control={control} />
            ))}
            {i18n && <I18nControls />}
            {source && (
              <a
                className="demo-icon-btn no-underline"
                href={sourceUrl(source)}
                target="_blank"
                rel="noreferrer"
                title="View demo source on GitHub"
                aria-label="View demo source on GitHub"
              >
                <FiCode aria-hidden className="size-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
