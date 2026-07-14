"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";

import { mainnetClient } from "../client";
import { CONTACTS } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { ListRow, Spinner } from "../ui";
import type { Recipient } from "./shared";
import { truncate } from "./shared";

const nameLike = (value: string) =>
  !value.startsWith("0x") && /^[^\s.]+(\.[^\s.]+)+$/.test(value);

type Lookup =
  | { status: "resolving"; name: string; }
  | { status: "resolved"; name: string; address: Address; }
  | { status: "not-found"; name: string; }
  | { status: "error"; name: string; };

export const RecipientScreen = ({ onPick }: { onPick: (recipient: Recipient) => void; }) => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const nameShaped = nameLike(trimmed);

  // Any name-shaped input goes through a real ENS lookup, debounced a beat.
  const [lookup, setLookup] = useState<Lookup>();

  useEffect(() => {
    if (!nameShaped) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLookup({ status: "resolving", name: trimmed });

      try {
        const address = await mainnetClient.getEnsAddress({ name: normalize(trimmed) });

        if (cancelled) return;

        setLookup(
          address
            ? { status: "resolved", name: trimmed, address: getAddress(address) }
            : { status: "not-found", name: trimmed },
        );
      }
      catch {
        if (!cancelled) setLookup({ status: "error", name: trimmed });
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, nameShaped]);

  // Only trust a lookup that matches the name currently in the field.
  const current = nameShaped && lookup?.name === trimmed ? lookup : undefined;

  const pasted = useMemo(() => {
    if (!isAddress(trimmed, { strict: false })) return;

    // A mixed-case address that fails the EIP-55 checksum is refused.
    if (trimmed !== trimmed.toLowerCase() && getAddress(trimmed.toLowerCase()) !== trimmed) {
      return;
    }

    return getAddress(trimmed.toLowerCase());
  }, [trimmed]);

  const checksumFailed
    = isAddress(trimmed, { strict: false }) && pasted === undefined;

  const suggestions = trimmed
    ? CONTACTS.filter(contact => contact.name.includes(trimmed.toLowerCase()))
    : CONTACTS;

  const resolvedContact = current?.status === "resolved"
    ? CONTACTS.find(contact => contact.name === current.name.toLowerCase())
    : undefined;

  return (
    <>
      <div className="flex flex-col gap-2 px-4 pt-2">
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
          {nameShaped && (current === undefined || current.status === "resolving") && (
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
        {current?.status === "not-found" && (
          <p className="rounded-lg bg-surfaceMuted px-3 py-2 text-xs text-muted">
            No address registered for
            {" "}
            <span className="font-medium text-secondary">{current.name}</span>
            .
          </p>
        )}
        {current?.status === "error" && (
          <p className="rounded-lg bg-warning-tint px-3 py-2 text-xs text-warning">
            Name lookup failed — check the connection and try again.
          </p>
        )}
      </div>
      <div className="flex flex-col pt-2 pb-3">
        {pasted && (
          <ListRow
            icon={<EnsAvatar address={pasted} size={36} />}
            title={truncate(pasted)}
            subtitle="Checksum valid — new recipient"
            onClick={() => onPick({ address: pasted })}
          />
        )}
        {current?.status === "resolved" && (
          <ListRow
            icon={<EnsAvatar address={current.address} name={current.name} size={36} />}
            title={current.name}
            subtitle={truncate(current.address)}
            onClick={() => onPick({ address: current.address, name: resolvedContact?.name ?? current.name })}
          />
        )}
        {!pasted && current?.status !== "resolved" && suggestions.length > 0 && (
          <>
            <span className="px-4 pt-1 pb-1.5 text-[11px] font-medium tracking-wide text-muted uppercase">
              Recents
            </span>
            {suggestions.map(contact => (
              <ListRow
                key={contact.address}
                icon={<EnsAvatar address={contact.address} name={contact.name} size={36} />}
                title={contact.name}
                subtitle={truncate(contact.address)}
                onClick={() => onPick(contact)}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};
