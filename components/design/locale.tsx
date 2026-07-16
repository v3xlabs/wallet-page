"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

import type { ShellControl } from "./shell";

/**
 * Locale handling for the design demos, modelled on how a wallet should treat
 * it: default to the device locale, let the user override it in settings.
 * Demos surface the setting as a DemoShell footer select, just like display
 * currency.
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

const unsubscribeNever = () => {};
const subscribeNever = () => unsubscribeNever;

/** The reader's device locale — "en-US" while prerendering. */
export const useBrowserLocale = () =>
  useSyncExternalStore(subscribeNever, () => navigator.language, () => "en-US");

const DemoLocaleContext = createContext("en-US");

/** DemoShell provides this to its children when given a `locale` prop. */
export const DemoLocaleProvider = DemoLocaleContext.Provider;

/** The locale selected in the enclosing demo's footer control. */
export const useDemoLocale = () => useContext(DemoLocaleContext);

/**
 * Demo-owned locale setting plus the footer control that drives it. Pass the
 * control into DemoShell's `controls` and the locale into its `locale` prop
 * so components inside the demo can read it back through `useDemoLocale`.
 */
export const useLocaleControl = (): [string, ShellControl] => {
  const browserLocale = useBrowserLocale();
  const [preference, setPreference] = useState("automatic");

  return [
    preference === "automatic" ? browserLocale : preference,
    {
      type: "select",
      label: "Locale",
      options: [{ value: "automatic", label: `Automatic (${browserLocale})` }, ...LOCALES],
      value: preference,
      onChange: setPreference,
    },
  ];
};
