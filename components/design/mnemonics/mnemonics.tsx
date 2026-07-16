"use client";

import classNames from "classnames";
import { useState } from "react";
import type { Address } from "viem";
import { english, mnemonicToAccount } from "viem/accounts";

import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";

/**
 * The canonical well-known test mnemonic. Demo value only - it is public
 * knowledge, so anything derived from it is permanently insecure.
 */
const MNEMONIC = "test test test test test test test test test test test junk";

const WORDS = MNEMONIC.split(" ");

const MAX_INDEX = 9;

/**
 * Derivation is deterministic, so the whole family of demo accounts is
 * computed once at module scope - never during render.
 */
const ACCOUNTS: Address[] = Array.from(
  { length: MAX_INDEX + 1 },
  (_, addressIndex) => mnemonicToAccount(MNEMONIC, { addressIndex }).address,
);

const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-6)}`;

const SectionLabel = ({ children }: { children: string; }) => (
  <span className="text-xs font-medium tracking-wide text-secondary uppercase">{children}</span>
);

const PATH_SEGMENTS: { text: string; hint: string; }[] = [
  { text: "m", hint: "Master key, derived from the seed" },
  { text: "44'", hint: "Purpose - BIP-44 multi-account layout (hardened)" },
  { text: "60'", hint: "Coin type - 60 is Ethereum (hardened)" },
  { text: "0'", hint: "Account - a hardened per-user grouping" },
  { text: "0", hint: "Change - always 0 (external) on Ethereum" },
];

const PathBuilder = ({ index, onIndex }: { index: number; onIndex: (index: number) => void; }) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-1 font-mono text-[13px]">
      {PATH_SEGMENTS.map(segment => (
        <span key={segment.hint} className="flex items-center gap-1">
          <span
            title={segment.hint}
            className="cursor-help rounded-md border border-primary bg-surfaceMuted px-2 py-1 text-secondary"
          >
            {segment.text}
          </span>
          <span className="text-muted">/</span>
        </span>
      ))}
      <span
        title="Address index - the only segment wallets usually change"
        className="flex items-center gap-0.5 rounded-md border border-primary bg-accenta2 py-0.5 pr-0.5 pl-2"
      >
        <span className="pr-1 font-semibold text-accent tabular-nums">{index}</span>
        <button
          type="button"
          onClick={() => onIndex(index - 1)}
          disabled={index === 0}
          aria-label="Decrement address index"
          className="flex size-6 cursor-pointer items-center justify-center rounded text-secondary transition-colors enabled:hover:bg-accenta3 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => onIndex(index + 1)}
          disabled={index === MAX_INDEX}
          aria-label="Increment address index"
          className="flex size-6 cursor-pointer items-center justify-center rounded text-secondary transition-colors enabled:hover:bg-accenta3 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </span>
    </div>
    <p className="font-mono text-[11px] text-muted">purpose' / coin' / account' / change / index</p>
  </div>
);

const AccountRow = ({ index, selected }: { index: number; selected: boolean; }) => {
  const address = ACCOUNTS[index];

  return (
    <div
      className={classNames(
        "flex items-center gap-3 px-3 py-2 transition-colors",
        selected && "bg-accenta2",
      )}
    >
      <span
        className={classNames(
          "w-6 shrink-0 font-mono text-xs tabular-nums",
          selected ? "font-semibold text-accent" : "text-muted",
        )}
      >
        #
        {index}
      </span>
      <EnsAvatar address={address} size={28} />
      <span className="min-w-0 truncate font-mono text-[13px] text-primary" title={address}>
        {truncate(address)}
      </span>
      {selected && (
        <span className="ml-auto shrink-0 text-[11px] font-medium text-accent">
          m/44'/60'/0'/0/
          {index}
        </span>
      )}
    </div>
  );
};

/** Recovery phrase, derivation-path builder and the accounts it yields. */
export const DerivationDemo = () => {
  const [index, setIndex] = useState(0);

  const listedIndexes = [0, 1, 2, 3, 4];

  return (
    <DemoShell source="components/design/mnemonics/mnemonics.tsx">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SectionLabel>Recovery phrase</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {WORDS.map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="flex items-baseline gap-1.5 rounded-md border border-primary bg-surfaceMuted px-2 py-1"
              >
                <span className="text-[10px] text-muted tabular-nums">{wordIndex + 1}</span>
                <span className="font-mono text-xs text-primary">{word}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-muted">
            The standard demo phrase - publicly known, never reuse it. These twelve words are the
            single seed behind every account below.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Derivation path</SectionLabel>
          <PathBuilder index={index} onIndex={setIndex} />
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Derived accounts</SectionLabel>
          <div className="divide-y divide-(--vocs-border-color-primary) overflow-hidden rounded-xl border border-primary bg-surface">
            {listedIndexes.map(listed => (
              <AccountRow key={listed} index={listed} selected={listed === index} />
            ))}
            {index > 4 && (
              <>
                <div className="px-3 py-1 text-center font-mono text-xs text-muted">⋯</div>
                <AccountRow index={index} selected />
              </>
            )}
          </div>
          <p className="text-xs text-muted">
            Same phrase, same path prefix - bumping only the final index yields a whole family of
            independent accounts.
          </p>
        </div>
      </div>
    </DemoShell>
  );
};

/** The BIP-39 wordlist autocomplete strip. */
export const WordlistDemo = () => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const matches = trimmed === ""
    ? []
    : english.filter(word => word.startsWith(trimmed)).slice(0, 6);

  return (
    <DemoShell source="components/design/mnemonics/mnemonics.tsx">
      <div className="flex flex-col gap-2">
        <SectionLabel>Wordlist autocomplete</SectionLabel>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a seed word…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="demo-input max-w-64 font-mono text-[13px]"
        />
        {matches.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matches.map(word => (
              <button
                key={word}
                type="button"
                onClick={() => setQuery(word)}
                className={classNames(
                  "cursor-pointer rounded-full border border-primary px-2.5 py-1 font-mono text-xs transition-colors",
                  word === trimmed
                    ? "bg-success-tint text-success"
                    : "bg-surfaceMuted text-secondary hover:bg-surfaceTint hover:text-primary",
                )}
              >
                {word}
              </button>
            ))}
          </div>
        )}
        {trimmed !== "" && matches.length === 0 && (
          <p className="text-xs text-destructive">
            Not a seed word - every valid word comes from the fixed list.
          </p>
        )}
        <p className="text-xs text-muted">
          All phrases draw from the same fixed 2,048-word list - autocomplete makes typos nearly
          impossible.
        </p>
      </div>
    </DemoShell>
  );
};
