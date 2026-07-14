"use client";

import { useState } from "react";

import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";
import {
  PrimaryButton,
  Segmented,
  StatusPill,
  SuccessCheck,
  WalletFrame,
  WalletHeader,
} from "../ui";
import { KeyScreen } from "./key";
import { PhraseScreen } from "./phrase";
import type { ImportResult } from "./shared";
import { truncate } from "./shared";
import { WatchScreen } from "./watch";

type Tab = "phrase" | "key" | "watch";

const TABS: { value: Tab; label: string; }[] = [
  { value: "phrase", label: "Phrase" },
  { value: "key", label: "Private key" },
  { value: "watch", label: "Watch" },
];

const SuccessScreen = ({ result, onDone }: { result: ImportResult; onDone: () => void; }) => (
  <div className="flex grow flex-col items-center justify-center gap-4 px-4 pt-6 pb-4">
    <SuccessCheck />
    <span className="text-lg font-semibold text-primary">
      {result.watchOnly ? "Now watching" : "Account imported"}
    </span>
    <div className="flex w-full items-center gap-3 rounded-xl border border-primary bg-surfaceMuted/50 px-3 py-2.5">
      <EnsAvatar
        address={result.address}
        name={result.name.includes(".") ? result.name : undefined}
        size={36}
      />
      <span className="flex min-w-0 grow flex-col">
        <span className="truncate text-sm font-medium text-primary">{result.name}</span>
        <span className="font-mono text-xs text-muted" title={result.address}>
          {truncate(result.address)}
        </span>
      </span>
      {result.watchOnly && <StatusPill tone="info">Watch-only</StatusPill>}
    </div>
    <div className="w-full pt-2">
      <PrimaryButton onClick={onDone}>Done</PrimaryButton>
    </div>
  </div>
);

export const ImportingDemo = () => {
  const [tab, setTab] = useState<Tab>("phrase");
  const [imported, setImported] = useState<ImportResult>();

  return (
    <DemoShell source="components/design/importing/importing.tsx">
      <WalletFrame className="min-h-[440px]">
        <WalletHeader title="Import account" />
        {imported
          ? <SuccessScreen result={imported} onDone={() => setImported(undefined)} />
          : (
              <>
                <div className="px-4 pt-1 pb-3">
                  <Segmented options={TABS} value={tab} onChange={setTab} />
                </div>
                {tab === "phrase" && <PhraseScreen onImport={setImported} />}
                {tab === "key" && <KeyScreen onImport={setImported} />}
                {tab === "watch" && <WatchScreen onImport={setImported} />}
              </>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
