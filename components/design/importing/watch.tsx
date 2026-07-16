"use client";

import { useEffect, useMemo, useState } from "react";
import { getAddress, isAddress } from "viem";

import { CONTACTS } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { PrimaryButton, Spinner } from "../ui";
import type { ImportResult } from "./shared";
import { truncate } from "./shared";

const nameLike = (value: string) =>
  !value.startsWith("0x") && /^[^\s.]+(\.[^\s.]+)+$/.test(value);

/**
 * Watch-only import: resolves known names like a real ENS lookup would, and
 * is explicit that watching grants sight, never signatures.
 */
export const WatchScreen = ({ onImport }: { onImport: (result: ImportResult) => void; }) => {
  const [query, setQueryRaw] = useState("");
  const [resolving, setResolving] = useState(false);
  const [importing, setImporting] = useState(false);

  const trimmed = query.trim();
  const nameShaped = nameLike(trimmed);

  const setQuery = (value: string) => {
    setQueryRaw(value);
    setResolving(nameLike(value.trim()));
  };

  useEffect(() => {
    if (!resolving) return;

    const timer = setTimeout(() => setResolving(false), 450);

    return () => clearTimeout(timer);
  }, [resolving, trimmed]);

  const resolved = useMemo(() => {
    if (!nameShaped || resolving) return;

    return CONTACTS.find(contact => contact.name === trimmed.toLowerCase());
  }, [trimmed, nameShaped, resolving]);

  const pasted = useMemo(() => {
    if (!isAddress(trimmed, { strict: false })) return;

    // A mixed-case address that fails the EIP-55 checksum is refused.
    if (trimmed !== trimmed.toLowerCase() && getAddress(trimmed.toLowerCase()) !== trimmed) {
      return;
    }

    return getAddress(trimmed.toLowerCase());
  }, [trimmed]);

  const checksumFailed = isAddress(trimmed, { strict: false }) && pasted === undefined;

  const candidate: ImportResult | undefined = resolved
    ? { address: resolved.address, name: resolved.name, watchOnly: true }
    : (pasted ? { address: pasted, name: "Watched account", watchOnly: true } : undefined);

  const startImport = () => {
    if (!candidate) return;

    setImporting(true);
    setTimeout(() => onImport(candidate), 700);
  };

  return (
    <div className="flex grow flex-col gap-2.5 px-4 pt-2 pb-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Address or ENS name"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="demo-input pr-9 font-mono text-[13px]"
        />
        {resolving && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">
            <Spinner />
          </span>
        )}
      </div>
      {checksumFailed && (
        <p className="rounded-lg bg-destructive-tint px-3 py-2 text-xs text-destructive">
          This address fails its checksum — it was likely corrupted in transit. Refusing it.
        </p>
      )}
      {nameShaped && !resolving && !resolved && (
        <p className="rounded-lg bg-surfaceMuted px-3 py-2 text-xs text-muted">
          No address registered for
          {" "}
          <span className="font-medium text-secondary">{trimmed}</span>
          .
        </p>
      )}
      {trimmed === "" && (
        <p className="text-[11px] text-muted">
          Try an ENS name like
          {" "}
          <button
            type="button"
            onClick={() => setQuery(CONTACTS[0].name)}
            className="cursor-pointer text-accent hover:underline"
          >
            {CONTACTS[0].name}
          </button>
          {" "}
          or paste any address.
        </p>
      )}
      {candidate && (
        <div className="mt-auto flex flex-col gap-3 border-t border-primary pt-3">
          <div className="flex items-center gap-3 px-1">
            <EnsAvatar
              address={candidate.address}
              name={candidate.name.includes(".") ? candidate.name : undefined}
              size={36}
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-primary">{candidate.name}</span>
              <span className="font-mono text-xs text-muted" title={candidate.address}>
                {truncate(candidate.address)}
              </span>
            </span>
          </div>
          <PrimaryButton onClick={startImport} disabled={importing}>
            {importing
              ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Adding…
                  </span>
                )
              : "Watch this address"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
