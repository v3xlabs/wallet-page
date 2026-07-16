"use client";

import type { FC, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { LuLanguages } from "react-icons/lu";

import { formatFiat } from "../../lib/display";
import type { DisplayCurrency } from "./data";
import { DISPLAY_CURRENCIES, toDisplayCurrency } from "./data";

/**
 * Shared i18n settings for the design demos, modelled on how a wallet should
 * treat them: one wallet-wide setting, defaulting locale to the device and
 * display currency to USD. Every demo reads the same store, so changing
 * either value in any demo footer changes it everywhere.
 */

export const LOCALES = [
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
  currency: DisplayCurrency;
};

let settings: I18nSettings = { locale: AUTOMATIC, currency: "USD" };

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
export const useBrowserLocale = () =>
  useSyncExternalStore(subscribeNever, () => navigator.language, () => "en-US");

const useI18nSettings = () =>
  useSyncExternalStore(subscribe, () => settings, () => INITIAL_SETTINGS);

/** The locale every demo formats with - the device locale unless overridden. */
export const useDemoLocale = () => {
  const browserLocale = useBrowserLocale();
  const { locale } = useI18nSettings();

  return locale === AUTOMATIC ? browserLocale : locale;
};

/** The display currency every demo prices fiat in. */
export const useDemoCurrency = () => useI18nSettings().currency;

/**
 * Fiat display bound to the shared locale and display currency: takes a USD
 * amount, returns it converted and localized.
 */
export const useFiat = () => {
  const locale = useDemoLocale();
  const currency = useDemoCurrency();

  return (usd: number) => formatFiat(toDisplayCurrency(usd, currency), currency, locale);
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
 * The wallet's two i18n settings - locale and display currency - as one
 * quiet footer cluster: an i18n glyph plus two label-less selects.
 */
export const I18nControls = () => {
  const browserLocale = useBrowserLocale();
  const { locale, currency } = useI18nSettings();

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
        label="Display currency"
        value={currency}
        display={currency}
        options={DISPLAY_CURRENCIES.map(entry => ({ value: entry, label: entry }))}
        onChange={(value) => {
          const next = DISPLAY_CURRENCIES.find(entry => entry === value);

          if (next) update({ currency: next });
        }}
      />
      <LuLanguages className="size-3.5 shrink-0" aria-hidden />
    </span>
  );
};
