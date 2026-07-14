"use client";

import classNames from "classnames";
import { useMemo, useState } from "react";
import { mnemonicToAccount } from "viem/accounts";

import { EnsAvatar } from "../ens-avatar";
import { PrimaryButton, Spinner } from "../ui";
import type { ImportResult } from "./shared";
import { DEMO_MNEMONIC, normalizePhrase, truncate, WORDLIST } from "./shared";

/**
 * Phrase import: tokenize as the user types, flag non-wordlist words early,
 * and only surface the derived account once the phrase is complete.
 */
export const PhraseScreen = ({ onImport }: { onImport: (result: ImportResult) => void; }) => {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);

  const words = normalizePhrase(text);
  const target = words.length > 12 ? 24 : 12;

  const account = useMemo(() => {
    const normalized = normalizePhrase(text);
    const valid
      = (normalized.length === 12 || normalized.length === 24)
        && normalized.every(word => WORDLIST.has(word));

    if (!valid) return;

    try {
      return mnemonicToAccount(normalized.join(" "));
    }
    catch {
      return;
    }
  }, [text]);

  const startImport = () => {
    if (!account) return;

    setImporting(true);
    setTimeout(() => onImport({ address: account.address, name: "Account 1" }), 700);
  };

  return (
    <div className="flex grow flex-col gap-2.5 px-4 pt-2 pb-4">
      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter your 12 or 24 word recovery phrase"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="demo-input resize-none font-mono text-[13px]"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tabular-nums">
          {words.length}
          {" "}
          /
          {" "}
          {target}
          {" "}
          words
        </span>
        <button
          type="button"
          onClick={() => setText(DEMO_MNEMONIC)}
          className="cursor-pointer rounded-md px-1 py-0.5 text-xs text-accent transition-colors hover:underline"
        >
          Use the demo phrase
        </button>
      </div>
      {words.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {words.map((word, index) => (
            <span
              key={index}
              className={classNames(
                "flex items-baseline gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs",
                WORDLIST.has(word)
                  ? "bg-surfaceMuted text-secondary"
                  : "bg-destructive-tint text-destructive",
              )}
              title={WORDLIST.has(word) ? undefined : "Not in the BIP-39 wordlist"}
            >
              <span className="text-[10px] opacity-60 tabular-nums">{index + 1}</span>
              {word}
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] text-muted">
        Whitespace and casing are cleaned up automatically — paste from anywhere.
      </p>
      {account && (
        <div className="mt-auto flex flex-col gap-3 border-t border-primary pt-3">
          <div className="flex items-center gap-3 px-1">
            <EnsAvatar address={account.address} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-primary">Account 1</span>
              <span className="font-mono text-xs text-muted" title={account.address}>
                {truncate(account.address)}
              </span>
            </span>
          </div>
          <PrimaryButton onClick={startImport} disabled={importing}>
            {importing
              ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Importing…
                  </span>
                )
              : "Import wallet"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
