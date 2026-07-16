"use client";

import type { FC } from "react";
import { useState } from "react";
import { FiClock } from "react-icons/fi";

import type { DemoToken } from "../data";
import { formatTokenAmount, TOKENS, usdValue } from "../data";
import { useDemoLocale, useDenomination } from "../locale";
import { DemoShell } from "../shell";
import { Field, StatusPill, TokenIcon } from "../ui";
import { formatPrice } from "./shared";

type Freshness = "live" | "stale" | "unavailable";

const FRESHNESS: { value: Freshness; label: string; }[] = [
  { value: "live", label: "Live" },
  { value: "stale", label: "Stale" },
  { value: "unavailable", label: "Unavailable" },
];

/** FNV-1a hash: deterministic seed per token symbol. */
const hashSeed = (input: string) => {
  let h = 2_166_136_261;

  for (const char of input) {
    h ^= char.codePointAt(0) ?? 0;
    h = Math.imul(h, 16_777_619);
  }

  return h >>> 0;
};

/** Tiny seeded PRNG (mulberry32) so charts never change between renders. */
const mulberry32 = (seed: number) => {
  let state = seed;

  return () => {
    state = Math.trunc(state + 0x6D_2B_79_F5);

    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const SPARK = { width: 160, height: 44, pad: 3, points: 40 };

/** Seeded pseudo-random walk, drifted and oriented to match the 24h sign. */
const sparklinePaths = (symbol: string, change: number) => {
  const random = mulberry32(hashSeed(symbol));
  const drift = change === 0 ? 0 : Math.sign(change) * 0.09;
  const values = [0];

  for (let index = 1; index < SPARK.points; index++) {
    values.push(values[index - 1] + random() - 0.5 + drift);
  }

  if (change !== 0 && Math.sign(values[SPARK.points - 1] - values[0]) !== Math.sign(change)) {
    values.reverse();
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  // Stablecoins should chart as calm, not zoomed-in to their noise.
  if (change === 0) {
    const noise = max - min || 1;

    min -= noise * 1.5;
    max += noise * 1.5;
  }

  const span = max - min || 1;
  const line = values
    .map((value, index) => {
      const x = SPARK.pad + (index * (SPARK.width - SPARK.pad * 2)) / (SPARK.points - 1);
      const y = SPARK.pad + ((max - value) / span) * (SPARK.height - SPARK.pad * 2);

      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return {
    line,
    area: `${line} L${SPARK.width - SPARK.pad} ${SPARK.height} L${SPARK.pad} ${SPARK.height} Z`,
  };
};

/** Precomputed in module scope: same symbol, same chart, every render. */
const SPARKLINES = Object.fromEntries(
  TOKENS.map(token => [token.symbol, sparklinePaths(token.symbol, token.change24h)] as const),
);

/** Colored via currentColor: parent sets success/destructive/muted text tone. */
const Sparkline: FC<{ symbol: string; }> = ({ symbol }) => {
  const paths = SPARKLINES[symbol];
  const gradientId = `design-spark-${symbol}`;

  return (
    <svg
      viewBox={`0 0 ${SPARK.width} ${SPARK.height}`}
      preserveAspectRatio="none"
      aria-hidden
      className="h-11 w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${gradientId})`} />
      <path
        d={paths.line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ChangeChip: FC<{ change: number; }> = ({ change }) => (
  <StatusPill tone={change > 0 ? "success" : (change < 0 ? "destructive" : "muted")}>
    {change > 0 && "▲ "}
    {change < 0 && "▼ "}
    <span className="tabular-nums">
      {Math.abs(change).toFixed(1)}
      %
    </span>
  </StatusPill>
);

const PriceTile: FC<{ token: DemoToken; freshness: Freshness; }> = ({
  token,
  freshness,
}) => {
  const locale = useDemoLocale();
  const denomination = useDenomination();
  const trendTone
    = token.change24h > 0 ? "text-success" : (token.change24h < 0 ? "text-destructive" : "text-muted");

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-primary bg-surface">
      {freshness === "stale" && (
        <div className="flex items-center gap-1.5 bg-warning-tint px-4 py-1.5 text-[11px] font-medium text-warning">
          <FiClock className="size-3 shrink-0" aria-hidden />
          As of 12 min ago
        </div>
      )}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={36} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-primary">{token.name}</span>
            <span className="text-xs text-muted">{token.symbol}</span>
          </span>
          <span className="ml-auto shrink-0">
            {freshness === "unavailable"
              ? <StatusPill tone="muted">-</StatusPill>
              : <ChangeChip change={token.change24h} />}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-semibold text-primary tabular-nums">
            {freshness === "unavailable" ? "-" : formatPrice(token.priceUsd, denomination, locale)}
          </span>
          {freshness === "live" && <span className="text-[11px] text-muted">Updated just now</span>}
        </div>
        {freshness === "unavailable"
          ? (
              <p className="rounded-lg bg-info-tint px-3 py-2 text-xs leading-relaxed text-info">
                Balances stay visible even when price feeds fail - never block the wallet on a
                price API.
              </p>
            )
          : (
              <div className={trendTone}>
                <Sparkline symbol={token.symbol} />
              </div>
            )}
        <div className="flex items-center justify-between gap-2 border-t border-primary pt-3">
          <span className="text-xs text-secondary">Your balance</span>
          <span className="flex flex-col items-end">
            <span className="text-sm font-medium text-primary tabular-nums">
              {formatTokenAmount(token.balance, token, locale)}
              {" "}
              {token.symbol}
            </span>
            <span className="text-xs text-muted tabular-nums">
              {freshness === "unavailable"
                ? "value unavailable"
                : formatPrice(usdValue(token, token.balance), denomination, locale)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const PricesDemo = () => {
  const [symbol, setSymbol] = useState("ETH");
  const [freshness, setFreshness] = useState<Freshness>("live");

  const token = TOKENS.find(candidate => candidate.symbol === symbol) ?? TOKENS[0];

  return (
    <DemoShell
      source="components/design/prices/prices.tsx"
      i18n
      controls={{
        "Price feed": {
          type: "tabs",
          options: FRESHNESS,
          value: freshness,
          onChange: value => setFreshness(value as Freshness),
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <Field label="Token">
          <select
            value={token.symbol}
            onChange={event => setSymbol(event.target.value)}
            className="demo-select w-fit min-w-36"
          >
            {TOKENS.map(candidate => (
              <option key={candidate.symbol} value={candidate.symbol}>
                {candidate.symbol}
                {" - "}
                {candidate.name}
              </option>
            ))}
          </select>
        </Field>
        <hr className="border-t border-primary" />
        <PriceTile token={token} freshness={freshness} />
      </div>
    </DemoShell>
  );
};
