"use client";

import classNames from "classnames";
import type { PropsWithChildren, ReactNode } from "react";
import { FiCode } from "react-icons/fi";

import { sourceUrl } from "../../lib/repo";
import { I18nControls } from "./locale";

/**
 * A footer control for a demo. Scenario switching reads best as `tabs`;
 * demo-specific settings (truncation style, …) read best as a labelled
 * `select`. Locale and display currency are not controls - they are the
 * shared i18n cluster, enabled with the `i18n` prop.
 */
export type ShellControl =
  | {
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
  <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label={name}>
    {control.options.map(option => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={option.value === control.value}
        onClick={() => control.onChange(option.value)}
        className={classNames(
          "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
          option.value === control.value
            ? "bg-accenta3 text-accent"
            : "text-secondary hover:bg-surfaceMuted hover:text-primary",
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
    <div className="relative my-6 overflow-hidden rounded-lg border border-primary">
      {source && (
        <a
          className="absolute top-3 right-3 z-10 inline-flex items-center rounded-full border border-primary bg-surface p-[0.35rem] font-mono text-xs leading-none text-secondary no-underline hover:border-(--vocs-text-color-secondary) hover:bg-surfaceMuted hover:text-primary"
          href={sourceUrl(source)}
          target="_blank"
          rel="noreferrer"
          title="View demo source on GitHub"
          aria-label="View demo source on GitHub"
        >
          <FiCode />
        </a>
      )}
      <div className="bg-code-block px-5 py-4">
        {children}
      </div>
      {(entries.length > 0 || i18n) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-primary bg-surface px-4 py-2">
          {tabs.map(([name, control]) => (
            control.type === "tabs" && <TabsControl key={name} name={name} control={control} />
          ))}
          {(selects.length > 0 || i18n) && (
            <div className="ml-auto flex flex-wrap items-center gap-3">
              {selects.map(([name, control]) => (
                control.type === "select" && <SelectControl key={name} control={control} />
              ))}
              {i18n && <I18nControls />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
