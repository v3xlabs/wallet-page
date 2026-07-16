"use client";

import type { FC, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { LuLanguages } from "react-icons/lu";

import { formatAssetAmount, formatFiat } from "../../lib/display";
import { denominationFor, DENOMINATIONS } from "./data";

/**
 * Shared i18n settings for the design demos, modelled on how a wallet should
 * treat them: one wallet-wide setting, defaulting locale to the device and
 * the value denomination to the first configured one. Every demo reads the
 * same store, so changing either value in any demo footer changes it
 * everywhere.
 */

const LOCALES = [
  { value: "en-US", label: "en-US · English (United States)" },
  { value: "de-DE", label: "de-DE · Deutsch (Deutschland)" },
  { value: "nl-NL", label: "nl-NL · Nederlands (Nederland)" },
  { value: "sv-SE", label: "sv-SE · Svenska (Sverige)" },
  { value: "fr-FR", label: "fr-FR · Français (France)" },
  { value: "hi-IN", label: "hi-IN · हिन्दी (भारत)" },
  { value: "ar-EG", label: "ar-EG · العربية (مصر)" },
  { value: "fa-IR", label: "fa-IR · فارسی (ایران)" },
] as const;

const AUTOMATIC = "automatic";

type I18nSettings = {
  /** A locale code, or `automatic` to follow the device. */
  locale: string;
  /** Code of the denomination values display in - fiat or asset. */
  denomination: string;
};

let settings: I18nSettings = { locale: AUTOMATIC, denomination: DENOMINATIONS[0].code };

/** Stable snapshot for prerendering, where the store never changes. */
const INITIAL_SETTINGS = settings;

const listeners = new Set<() => void>();

const update = (patch: Partial<I18nSettings>) => {
  settings = { ...settings, ...patch };

  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const unsubscribeNever = () => {};
const subscribeNever = () => unsubscribeNever;

/** The reader's device locale - "en-US" while prerendering. */
const useBrowserLocale = () =>
  useSyncExternalStore(subscribeNever, () => navigator.language, () => "en-US");

const useI18nSettings = () =>
  useSyncExternalStore(subscribe, () => settings, () => INITIAL_SETTINGS);

/** The locale every demo formats with - the device locale unless overridden. */
export const useDemoLocale = () => {
  const browserLocale = useBrowserLocale();
  const { locale } = useI18nSettings();

  return locale === AUTOMATIC ? browserLocale : locale;
};

/** The denomination every demo displays value in - fiat or asset. */
export const useDenomination = () => denominationFor(useI18nSettings().denomination);

/**
 * Value display bound to the shared locale and denomination: takes an
 * amount in the price feed's quote units, returns it converted and
 * localized - "$1.87", "1,72 €", or "0.00048 ETH" alike.
 */
export const useDisplayValue = () => {
  const locale = useDemoLocale();
  const denomination = useDenomination();

  return (quoted: number) => {
    const value = quoted * denomination.rate;

    return denomination.kind === "fiat"
      ? formatFiat(value, denomination.code, locale)
      : formatAssetAmount(value, denomination.code, locale);
  };
};

/**
 * Label-less native select: a compact readout with the real `<select>`
 * stretched invisibly over it, so the dropdown stays fully native.
 */
const CompactSelect: FC<{
  label: string;
  value: string;
  display: ReactNode;
  options: readonly { value: string; label: string; }[];
  onChange: (value: string) => void;
}> = ({ label, value, display, options, onChange }) => (
  <span className="relative inline-flex">
    <select
      aria-label={label}
      title={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="peer absolute inset-0 w-full cursor-pointer opacity-0"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <span className="pointer-events-none flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs text-secondary transition-colors peer-hover:bg-surfaceMuted peer-hover:text-primary peer-focus-visible:bg-surfaceMuted peer-focus-visible:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-accenta3 peer-active:bg-surfaceTint">
      {display}
      <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-3">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </span>
);

/**
 * The wallet's two i18n settings - locale and value denomination - as one
 * quiet footer cluster: two label-less selects plus an i18n glyph.
 */
export const I18nControls = () => {
  const browserLocale = useBrowserLocale();
  const { locale, denomination } = useI18nSettings();

  return (
    <span className="flex items-center gap-0.5 text-muted">
      <CompactSelect
        label="Locale"
        value={locale}
        display={locale === AUTOMATIC ? browserLocale : locale}
        options={[{ value: AUTOMATIC, label: `Automatic (${browserLocale})` }, ...LOCALES]}
        onChange={value => update({ locale: value })}
      />
      <CompactSelect
        label="Display denomination"
        value={denomination}
        display={denomination}
        options={DENOMINATIONS.map(entry => ({ value: entry.code, label: entry.code }))}
        onChange={value => update({ denomination: denominationFor(value).code })}
      />
      <LuLanguages className="size-3.5 shrink-0" aria-hidden />
    </span>
  );
};
