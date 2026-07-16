"use client";

import { useState } from "react";

import { useDemoLocale, useFiat } from "../locale";
import { DemoShell } from "../shell";
import { WalletFrame, WalletHeader } from "../ui";
import type { EntryKind } from "./entries";
import { confirmPending, GROUPS, historyEntries } from "./entries";
import { EntryRow } from "./row";

type Filter = "all" | "sent" | "received" | "approvals";

const FILTERS: readonly { value: Filter; label: string; }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "received", label: "Received" },
  { value: "approvals", label: "Approvals" },
];

const FILTER_KIND: Record<Exclude<Filter, "all">, EntryKind> = {
  sent: "send",
  received: "receive",
  approvals: "approve",
};

export const HistoryDemo = () => {
  const locale = useDemoLocale();
  const fiat = useFiat();
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string>();
  const [speedUp, setSpeedUp] = useState<"idle" | "speeding" | "confirmed">("idle");

  const requestSpeedUp = () => {
    setSpeedUp("speeding");
    setTimeout(() => setSpeedUp("confirmed"), 800);
  };

  const entries = historyEntries(locale, fiat).map(entry =>
    (entry.status === "pending" && speedUp === "confirmed" ? confirmPending(entry) : entry),
  );

  const visible = filter === "all"
    ? entries
    : entries.filter(entry => entry.kind === FILTER_KIND[filter]);

  return (
    <DemoShell
      source="components/design/history/history.tsx"
      i18n
      controls={{
        Filter: {
          type: "tabs",
          options: FILTERS,
          value: filter,
          onChange: value => setFilter(value as Filter),
        },
      }}
    >
      <WalletFrame>
        <WalletHeader title="Activity" />
        <div className="flex flex-col pt-1 pb-3">
          {GROUPS.map((group) => {
            const rows = visible.filter(entry => entry.group === group);

            if (rows.length === 0) return null;

            return (
              <div key={group} className="flex flex-col">
                <span className="px-4 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted uppercase">
                  {group}
                </span>
                {rows.map(entry => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedId === entry.id}
                    onToggle={() =>
                      setExpandedId(current => (current === entry.id ? undefined : entry.id))}
                    speeding={entry.status === "pending" && speedUp === "speeding"}
                    onSpeedUp={requestSpeedUp}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </WalletFrame>
    </DemoShell>
  );
};
