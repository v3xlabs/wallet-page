"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import { formatBaseUnits, parseLocalizedAmount } from "../../../lib/amounts";
import { DemoShell } from "../shell";

const LOCALES = [
  { locale: "en-US", label: "English (United States)" },
  { locale: "de-DE", label: "Deutsch (Deutschland)" },
  { locale: "nl-NL", label: "Nederlands (Nederland)" },
  { locale: "sv-SE", label: "Svenska (Sverige)" },
  { locale: "fr-FR", label: "Français (France)" },
  { locale: "ar-EG", label: "العربية (مصر)" },
  { locale: "fa-IR", label: "فارسی (ایران)" },
];

type AmountsLocaleContextValue = {
  browserLocale: string;
  locale: string;
  localePreference: string;
  setLocalePreference: (locale: string) => void;
};

const AmountsLocaleContext = createContext<AmountsLocaleContextValue | undefined>(undefined);

const useAmountsLocale = () => {
  const context = useContext(AmountsLocaleContext);

  if (context === undefined) throw new Error("Amount demos must be inside AmountsLocaleProvider");

  return context;
};

export const AmountsLocaleProvider = ({ children }: { children: ReactNode; }) => {
  const browserLocale = navigator.language;
  const [localePreference, setLocalePreference] = useState("automatic");
  const locale = localePreference === "automatic" ? browserLocale : localePreference;

  return (
    <AmountsLocaleContext.Provider value={{ browserLocale, locale, localePreference, setLocalePreference }}>
      {children}
    </AmountsLocaleContext.Provider>
  );
};

const LocaleControl = () => {
  const { browserLocale, localePreference, setLocalePreference } = useAmountsLocale();

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-secondary uppercase">Locale</span>
      <select
        className="w-full rounded-lg border border-primary bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accenta3 cursor-pointer"
        value={localePreference}
        onChange={event => setLocalePreference(event.target.value)}
      >
        <option value="automatic">{`System default (${browserLocale})`}</option>
        {LOCALES.map(option => (
          <option key={option.locale} value={option.locale}>
            {`${option.locale} · ${option.label}`}
          </option>
        ))}
      </select>
    </label>
  );
};

const DecimalsControl = ({ value, max, onChange }: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-wide text-secondary uppercase">Decimals</span>
    <input
      className="w-full rounded-lg border border-primary bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accenta3"
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={event => onChange(Number(event.target.value))}
    />
  </label>
);

export const AmountInput = ({ value, locale, decimals, onChange }: {
  value: string;
  locale: string;
  decimals: number;
  onChange?: (value: string) => void;
}) => {
  const parsed = parseLocalizedAmount(value, locale, decimals);

  return (
    <div className="rounded-xl border border-primary bg-surface p-3">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label="Amount"
        aria-invalid={parsed.status === "invalid"}
        value={value}
        onChange={event => onChange?.(event.target.value)}
        className={`w-full bg-transparent text-right text-3xl font-medium outline-none placeholder:text-muted read-only:cursor-default ${parsed.status === "invalid" ? "text-red-500" : "text-primary"}`}
        placeholder="0"
      />
    </div>
  );
};

export const AmountInputDemo = () => {
  const { browserLocale, locale } = useAmountsLocale();
  const [decimals, setDecimals] = useState(2);
  const [amount, setAmount] = useState(() => formatBaseUnits(123_456n, browserLocale, 2) ?? "1234.56");
  const parsed = parseLocalizedAmount(amount, locale, decimals);

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20.75rem)] [&>.wallet-demo]:m-0">
      <DemoShell>
        <div className="mx-auto max-w-sm">
          <AmountInput
            value={amount}
            locale={locale}
            decimals={decimals}
            onChange={setAmount}
          />
          <p className="m-0 mt-2 text-right text-xs text-secondary wrap-anywhere" aria-live="polite">
            {parsed.status === "valid" && <code>{`That's ${parsed.baseUnits.toString()} base units`}</code>}
            {parsed.status === "partial" && "Keep typing…"}
            {parsed.status === "invalid" && "That amount is not valid for this locale and asset."}
          </p>
        </div>
      </DemoShell>
      <div className="grid gap-4">
        <LocaleControl />
        <DecimalsControl value={decimals} max={255} onChange={setDecimals} />
      </div>
    </div>
  );
};

export const AmountDisplayDemo = () => {
  const { locale } = useAmountsLocale();
  const [baseUnits, setBaseUnits] = useState("123456");
  const [decimals, setDecimals] = useState(2);
  const parsedBaseUnits = /^\d+$/u.test(baseUnits) ? BigInt(baseUnits) : undefined;
  const formatted = parsedBaseUnits === undefined
    ? undefined
    : formatBaseUnits(parsedBaseUnits, locale, decimals);

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20.75rem)] [&>.wallet-demo]:m-0">
      <DemoShell>
        <div className="mx-auto max-w-sm">
          <div className="rounded-xl border border-primary bg-surface p-3 text-right">
            <output className="text-3xl font-medium text-primary" aria-live="polite">
              <bdi>{formatted ?? "—"}</bdi>
            </output>
          </div>
          <p className="m-0 mt-2 text-right text-xs text-secondary">
            {formatted === undefined && "Enter valid base units and 0-100 decimals."}
          </p>
        </div>
      </DemoShell>
      <div className="grid gap-4">
        <LocaleControl />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-secondary uppercase">Base units</span>
          <input
            className="w-full rounded-lg border border-primary bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accenta3"
            type="text"
            inputMode="numeric"
            value={baseUnits}
            onChange={event => setBaseUnits(event.target.value)}
          />
        </label>
        <DecimalsControl value={decimals} max={100} onChange={setDecimals} />
      </div>
    </div>
  );
};
