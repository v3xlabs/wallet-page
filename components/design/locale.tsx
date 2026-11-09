"use client";

import { useSyncExternalStore } from "react";
import { LuLanguages } from "react-icons/lu";

import { formatAssetAmount, formatFiat } from "../../lib/display";
import { Select } from "../select";
import { denominationFor, DENOMINATIONS } from "./data";

/**
 * Shared i18n settings for the design demos, modelled on how a wallet should
 * treat them: one wallet-wide setting, defaulting locale to the device and
 * the value denomination to the first configured one. Every demo reads the
 * same store, so changing either value in any demo footer changes it
 * everywhere.
 */

const LOCALES = [
  { value: "en-US", label: "en-US", detail: "English (United States)" },
  { value: "de-DE", label: "de-DE", detail: "Deutsch (Deutschland)" },
  { value: "nl-NL", label: "nl-NL", detail: "Nederlands (Nederland)" },
  { value: "sv-SE", label: "sv-SE", detail: "Svenska (Sverige)" },
  { value: "fr-FR", label: "fr-FR", detail: "Français (France)" },
  { value: "hi-IN", label: "hi-IN", detail: "हिन्दी (भारत)" },
  { value: "ar-EG", label: "ar-EG", detail: "العربية (مصر)" },
  { value: "fa-IR", label: "fa-IR", detail: "فارسی (ایران)" },
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

const COMPACT_TRIGGER = "h-8 rounded-md px-2 text-sm text-secondary outline-none transition-colors hover:bg-surfaceTint hover:text-heading focus-visible:bg-surfaceTint focus-visible:text-heading focus-visible:ring-2 focus-visible:ring-accenta3 aria-expanded:bg-surfaceTint aria-expanded:text-heading";

/**
 * The wallet's two i18n settings - locale and value denomination - as one
 * quiet footer cluster: two label-less selects plus an i18n glyph.
 */
export const I18nControls = () => {
  const browserLocale = useBrowserLocale();
  const { locale, denomination } = useI18nSettings();

  return (
    <span className="flex items-center gap-0.5 text-muted">
      <Select
        label="Locale"
        value={locale}
        display={locale === AUTOMATIC ? browserLocale : locale}
        options={[{ value: AUTOMATIC, label: "Automatic", detail: browserLocale }, ...LOCALES]}
        onChange={value => update({ locale: value })}
        className={COMPACT_TRIGGER}
      />
      <Select
        label="Display denomination"
        value={denomination}
        options={DENOMINATIONS.map(entry => ({ value: entry.code, label: entry.code }))}
        onChange={value => update({ denomination: denominationFor(value).code })}
        className={COMPACT_TRIGGER}
      />
      <LuLanguages className="size-3.5 shrink-0" aria-hidden />
    </span>
  );
};
