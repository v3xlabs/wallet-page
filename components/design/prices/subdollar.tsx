"use client";

import { useDemoCurrency, useDemoLocale } from "../locale";
import { DemoShell } from "../shell";
import { TokenIcon } from "../ui";
import { formatPrice, formatPriceNaive } from "./shared";

/**
 * Mock prices across magnitudes where fixed decimals stop working and
 * significant digits take over.
 */
const CASES: { symbol: string; name: string; color: string; priceUsd: number; }[] = [
  { symbol: "NRD", name: "Near-dollar (mock)", color: "#8b5cf6", priceUsd: 0.9137 },
  { symbol: "CNT", name: "Cent-range (mock)", color: "#0e7490", priceUsd: 0.084_21 },
  { symbol: "PEPE", name: "Pepe (mock)", color: "#4c9540", priceUsd: 0.000_021_3 },
];

export const SubDollarDemo = () => {
  const locale = useDemoLocale();
  const currency = useDemoCurrency();

  return (
    <DemoShell source="components/design/prices/subdollar.tsx" i18n>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col divide-y divide-(--vocs-border-color-primary) rounded-lg border border-primary bg-surface">
          {CASES.map(token => (
            <div key={token.symbol} className="flex items-center gap-3 px-3 py-2.5">
              <TokenIcon symbol={token.symbol} color={token.color} size={28} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-primary">{token.name}</span>
                <span className="text-xs text-muted">{token.symbol}</span>
              </span>
              <span className="ml-auto flex shrink-0 flex-col items-end">
                <span className="text-sm font-medium text-success tabular-nums">
                  {formatPrice(token.priceUsd, currency, locale)}
                </span>
                <span className="text-[11px] text-muted">4 significant digits</span>
              </span>
              <span className="flex w-24 shrink-0 flex-col items-end">
                <span className="text-sm text-destructive line-through tabular-nums">
                  {formatPriceNaive(token.priceUsd, currency, locale)}
                </span>
                <span className="text-[11px] text-muted">2 fixed decimals</span>
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          {`Prices of ${formatPriceNaive(1, currency, locale)} and above get two fixed decimals; below that, four significant digits keep sub-dollar prices honest instead of rounding them toward ${formatPriceNaive(0, currency, locale)}.`}
        </p>
      </div>
    </DemoShell>
  );
};
