"use client";

import classNames from "classnames";
import type { FC, ReactNode } from "react";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";

import type { DemoToken } from "../data";
import { TOKENS } from "../data";
import { DemoShell } from "../shell";
import { Field, Segmented } from "../ui";

type LocaleId = "en-US" | "de-DE" | "fr-FR" | "ja-JP";

const LOCALES: { value: LocaleId; label: string; }[] = [
  { value: "en-US", label: "en-US" },
  { value: "de-DE", label: "de-DE" },
  { value: "fr-FR", label: "fr-FR" },
  { value: "ja-JP", label: "ja-JP" },
];

/** The demo trio spans the interesting decimal counts: 18, 6 and 8. */
const AMOUNT_TOKENS = TOKENS.filter(token => ["ETH", "USDC", "WBTC"].includes(token.symbol));

type Separators = { group: string; decimal: string; };

/** Ask Intl for the locale's separators instead of hardcoding a table. */
const separatorsFor = (locale: LocaleId): Separators => {
  const parts = new Intl.NumberFormat(locale).formatToParts(1_234_567.89);

  return {
    group: parts.find(part => part.type === "group")?.value ?? ",",
    decimal: parts.find(part => part.type === "decimal")?.value ?? ".",
  };
};

const SEPARATORS = Object.fromEntries(
  LOCALES.map(({ value }) => [value, separatorsFor(value)] as const),
) as Record<LocaleId, Separators>;

/** Users type a plain space even where the locale wants a narrow no-break one. */
const SPACE_LIKE = /[\u00A0\u2009\u202F ]/g;

const sepLabel = (separator: string) => (/\s/.test(separator) ? "space" : `"${separator}"`);

type Parsed =
  | { kind: "empty"; }
  | { kind: "invalid"; reason: string; }
  | { kind: "parsed"; canonical: string; baseUnits: bigint; lostDigits: string; };

/**
 * Parse a human-typed amount under the selected locale's rules. Strict on
 * purpose: an ambiguous amount is rejected, never guessed at — a misread
 * separator moves money by a factor of a thousand.
 */
const parseLocaleAmount = (raw: string, locale: LocaleId, token: DemoToken): Parsed => {
  const { group, decimal } = SEPARATORS[locale];
  let text = raw.trim();

  if (!text) return { kind: "empty" };

  if (/\s/.test(group)) text = text.replaceAll(SPACE_LIKE, group);

  const stray = [...text].find(char => !/\d/.test(char) && char !== group && char !== decimal);

  if (stray !== undefined) {
    return {
      kind: "invalid",
      reason: `"${stray}" is not a digit or a ${locale} separator (${sepLabel(group)} groups thousands, ${sepLabel(decimal)} starts decimals).`,
    };
  }

  const decimalAt = text.indexOf(decimal);

  if (decimalAt !== text.lastIndexOf(decimal)) {
    return {
      kind: "invalid",
      reason: `Two ${sepLabel(decimal)} decimal separators — ambiguous. Reject it; never guess.`,
    };
  }

  const integerPart = decimalAt === -1 ? text : text.slice(0, decimalAt);
  const fractionPart = decimalAt === -1 ? "" : text.slice(decimalAt + decimal.length);

  if (fractionPart.includes(group)) {
    return {
      kind: "invalid",
      reason: `A ${sepLabel(group)} group separator inside the decimals — this reads like an amount from a different locale. Reject it.`,
    };
  }

  if (integerPart.includes(group)) {
    const groups = integerPart.split(group);

    if (
      groups[0].length === 0
      || groups[0].length > 3
      || groups.slice(1).some(part => part.length !== 3)
    ) {
      return {
        kind: "invalid",
        reason: `Misplaced ${sepLabel(group)} — thousands come in groups of three. A stray group separator is usually a mistyped decimal separator.`,
      };
    }
  }

  const integerDigits = integerPart.replaceAll(group, "");

  if (!integerDigits && !fractionPart) {
    return { kind: "invalid", reason: "Separators alone carry no value — keep typing." };
  }

  const kept = fractionPart.slice(0, token.decimals);

  return {
    kind: "parsed",
    canonical: `${integerDigits || "0"}${fractionPart ? `.${fractionPart}` : ""}`,
    baseUnits: parseUnits(`${integerDigits || "0"}${kept ? `.${kept}` : ""}`, token.decimals),
    lostDigits: fractionPart.slice(token.decimals),
  };
};

const EXAMPLES = ["1,234.56", "1.234,56", "12 345,67", "0.1234567"];

/** One step of the typed → parsed → base units → displayed pipeline. */
const PipelineRow: FC<{ label: string; value: ReactNode; hint?: ReactNode; }> = ({
  label,
  value,
  hint,
}) => (
  <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5 px-3 py-2">
    <span className="text-[11px] font-medium tracking-wide text-secondary uppercase">{label}</span>
    <span className="min-w-0">{value}</span>
    {hint !== undefined && <span className="col-start-2 text-[11px] text-muted">{hint}</span>}
  </div>
);

const Missing = () => <span className="text-xs text-muted">—</span>;

export const AmountsDemo = () => {
  const [locale, setLocale] = useState<LocaleId>("en-US");
  const [symbol, setSymbol] = useState("USDC");
  const [text, setText] = useState("1,234.56");

  const token = AMOUNT_TOKENS.find(candidate => candidate.symbol === symbol) ?? AMOUNT_TOKENS[0];
  const { group, decimal } = SEPARATORS[locale];
  const parsed = parseLocaleAmount(text, locale, token);
  const result = parsed.kind === "parsed" ? parsed : undefined;
  const keptCanonical = result?.canonical.slice(0, result.canonical.length - result.lostDigits.length);

  const displayed = result
    ? new Intl.NumberFormat(locale, {
        maximumFractionDigits: Math.min(token.decimals, 18),
      }).format(Number(formatUnits(result.baseUnits, token.decimals)))
    : undefined;

  const status: { tone: "muted" | "success" | "warning" | "destructive"; text: string; } = (() => {
    switch (parsed.kind) {
      case "empty": {
        return { tone: "muted", text: "Type an amount to see how the wallet parses it." };
      }
      case "invalid": {
        return { tone: "destructive", text: parsed.reason };
      }
      case "parsed": {
        if (parsed.lostDigits) {
          return {
            tone: "warning",
            text: `${token.symbol} has ${token.decimals} decimals — the extra digit${parsed.lostDigits.length === 1 ? "" : "s"} "${parsed.lostDigits}" would be silently lost. Warn before truncating.`,
          };
        }

        return {
          tone: "success",
          text: `Valid under ${locale} rules: ${sepLabel(group)} groups thousands, ${sepLabel(decimal)} starts the decimals.`,
        };
      }
    }
  })();

  /** Display-rule samples follow the selected locale too. */
  const sample = (value: number, maxFraction: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: maxFraction }).format(value);

  return (
    <DemoShell source="components/design/amounts/amounts.tsx">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
          <Field label="Locale">
            <Segmented fit value={locale} onChange={setLocale} options={LOCALES} />
          </Field>
          <Field label="Token">
            <Segmented
              fit
              value={token.symbol}
              onChange={setSymbol}
              options={AMOUNT_TOKENS.map(candidate => ({
                value: candidate.symbol,
                label: candidate.symbol,
              }))}
            />
            <span className="text-xs text-muted">
              {token.name}
              {" · "}
              {token.decimals}
              {" "}
              decimals
            </span>
          </Field>
        </div>
        <Field label="Amount">
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder={new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(1234.56)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="demo-input font-mono tabular-nums"
          />
        </Field>
        <p
          className={classNames("text-[13px]", {
            "text-muted": status.tone === "muted",
            "text-success": status.tone === "success",
            "text-warning": status.tone === "warning",
            "text-destructive": status.tone === "destructive",
          })}
        >
          {status.text}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">Try:</span>
          {EXAMPLES.map(example => (
            <button
              key={example}
              type="button"
              onClick={() => setText(example)}
              className="demo-btn px-2 py-1 font-mono text-xs tabular-nums"
            >
              {example}
            </button>
          ))}
        </div>
        <hr className="border-t border-primary" />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-secondary uppercase">
            What the wallet stores
          </span>
          <div className="flex flex-col divide-y divide-(--vocs-border-color-primary) rounded-lg border border-primary bg-surface">
            <PipelineRow
              label="Typed"
              value={
                text.trim()
                  ? <span className="font-mono text-xs break-all text-primary">{text}</span>
                  : <Missing />
              }
              hint={`raw ${locale} input, exactly as entered`}
            />
            <PipelineRow
              label="Parsed"
              value={
                result
                  ? (
                      <span className="font-mono text-xs break-all text-primary">
                        {keptCanonical}
                        {result.lostDigits && (
                          <span className="text-warning line-through">{result.lostDigits}</span>
                        )}
                      </span>
                    )
                  : <Missing />
              }
              hint="locale-independent decimal string"
            />
            <PipelineRow
              label="Base units"
              value={
                result
                  ? (
                      <span className="font-mono text-xs break-all text-primary">
                        {result.baseUnits.toString()}
                      </span>
                    )
                  : <Missing />
              }
              hint={`integer with ${token.decimals} implied decimals — the exact value that gets signed`}
            />
            <PipelineRow
              label="Displayed"
              value={
                displayed
                  ? (
                      <span className="text-sm font-medium text-primary tabular-nums">
                        {displayed}
                        {" "}
                        {token.symbol}
                      </span>
                    )
                  : <Missing />
              }
              hint={`Intl.NumberFormat("${locale}") — display only, never what gets signed`}
            />
          </div>
        </div>
        <hr className="border-t border-primary" />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-secondary uppercase">
            Display rules
          </span>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5 rounded-lg border border-primary bg-surface px-3 py-2.5">
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Dust</span>
              <span
                className="cursor-help text-sm font-medium text-primary tabular-nums"
                title="0.000034 ETH"
              >
                {`<${sample(0.0001, 4)} ETH`}
              </span>
              <span className="text-xs text-muted">
                Round to a floor, never down to a misleading 0.
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-primary bg-surface px-3 py-2.5">
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Whale</span>
              <span
                className="cursor-help text-sm font-medium text-primary tabular-nums"
                title="4821904.55 USDC"
              >
                {`${sample(4_821_904.55, 2)} USDC`}
              </span>
              <span className="text-xs text-muted">
                Locale grouping keeps large magnitudes readable.
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-primary bg-surface px-3 py-2.5">
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Hover</span>
              <span
                className="cursor-help text-sm font-medium text-primary tabular-nums"
                title="1.28472634 ETH"
              >
                {`${sample(1.284_726_34, 4)} ETH`}
              </span>
              <span className="text-xs text-muted">
                Truncate on screen; full precision lives in the title.
              </span>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
};
