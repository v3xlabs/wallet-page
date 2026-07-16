"use client";

import { useState } from "react";

import { formatBaseUnits, parseLocalizedAmount } from "../../../lib/amounts";
import { useDemoLocale } from "../locale";
import { DemoShell } from "../shell";
import { Field } from "../ui";

const SOURCE = "components/design/amounts/amounts.tsx";

const DecimalsField = ({ value, max, onChange }: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <Field label="Decimals">
    <input
      className="demo-input w-24"
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={event => onChange(Number(event.target.value))}
    />
  </Field>
);

/** Reference amount field: parses with one explicit locale, exactly. */
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
  const locale = useDemoLocale();
  const [decimals, setDecimals] = useState(2);
  const [amount, setAmount] = useState(() => formatBaseUnits(123_456n, locale, 2) ?? "1234.56");
  const parsed = parseLocalizedAmount(amount, locale, decimals);

  return (
    <DemoShell source={SOURCE} i18n>
      <div className="flex flex-col gap-4">
        <DecimalsField value={decimals} max={255} onChange={setDecimals} />
        <hr className="border-t border-primary" />
        <div className="mx-auto w-full max-w-sm">
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
      </div>
    </DemoShell>
  );
};

export const AmountDisplayDemo = () => {
  const locale = useDemoLocale();
  const [baseUnits, setBaseUnits] = useState("123456");
  const [decimals, setDecimals] = useState(2);
  const parsedBaseUnits = /^\d+$/u.test(baseUnits) ? BigInt(baseUnits) : undefined;
  const formatted = parsedBaseUnits === undefined
    ? undefined
    : formatBaseUnits(parsedBaseUnits, locale, decimals);

  return (
    <DemoShell source={SOURCE} i18n>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Base units">
            <input
              className="demo-input w-48 font-mono"
              type="text"
              inputMode="numeric"
              value={baseUnits}
              onChange={event => setBaseUnits(event.target.value)}
            />
          </Field>
          <DecimalsField value={decimals} max={100} onChange={setDecimals} />
        </div>
        <hr className="border-t border-primary" />
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-xl border border-primary bg-surface p-3 text-right">
            <output className="text-3xl font-medium text-primary" aria-live="polite">
              <bdi>{formatted ?? "-"}</bdi>
            </output>
          </div>
          <p className="m-0 mt-2 text-right text-xs text-secondary">
            {formatted === undefined && "Enter valid base units and 0-100 decimals."}
          </p>
        </div>
      </div>
    </DemoShell>
  );
};
