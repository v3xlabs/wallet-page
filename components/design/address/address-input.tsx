"use client";

import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { type Address, getAddress } from "viem";
import { normalize } from "viem/ens";

import { mainnetClient } from "../client";
import { DemoShell } from "../shell";
import { Field } from "../ui";

const HEX_ADDRESS = /^0x[0-9a-f]{40}$/i;
const PARTIAL_HEX = /^0(x[0-9a-f]{0,39})?$/i;

type Parsed =
  | { kind: "empty"; }
  | { kind: "partial"; }
  | { kind: "address"; address: Address; wasChecksummed: boolean; }
  | { kind: "checksum-mismatch"; }
  | { kind: "name"; name: string; }
  | { kind: "invalid"; };

/** Strip whitespace and unwrap an EIP-681 URL down to its address/name. */
const sanitize = (raw: string) => {
  let value = raw.trim();

  if (value.toLowerCase().startsWith("ethereum:")) {
    value = value.slice("ethereum:".length).split(/[@/?]/)[0];
  }

  return value;
};

const parse = (value: string): Parsed => {
  if (!value) return { kind: "empty" };

  if (HEX_ADDRESS.test(value)) {
    const canonical = getAddress(value.toLowerCase());

    if (value === value.toLowerCase()) {
      return { kind: "address", address: canonical, wasChecksummed: false };
    }

    if (value === canonical) {
      return { kind: "address", address: canonical, wasChecksummed: true };
    }

    return { kind: "checksum-mismatch" };
  }

  if (PARTIAL_HEX.test(value)) return { kind: "partial" };

  // Name-shaped: at least one dot separating non-empty labels, no 0x prefix.
  if (!value.startsWith("0x") && /^[^\s.]+(\.[^\s.]+)+$/.test(value)) {
    return { kind: "name", name: value };
  }

  return { kind: "invalid" };
};

type Resolution =
  | { status: "resolved"; name: string; address: Address; }
  | { status: "not-found"; name: string; }
  | { status: "error"; name: string; message: string; };

const EXAMPLES: { label: string; value: string; }[] = [
  { label: "ENS name", value: "vitalik.eth" },
  { label: "Lowercase", value: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" },
  { label: "Checksummed", value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "Bad checksum", value: "0xd8dA6bF26964aF9D7eEd9e03E53415D37aA96045" },
  {
    label: "EIP-681 URL",
    value:
      "ethereum:0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@1/?value=1000000000000000000",
  },
];

export const AddressInputDemo = () => {
  const [value, setValue] = useState("vitalik.eth");
  // Which footer example the field currently shows; typing clears it.
  const [example, setExample] = useState("ENS name");
  const parsed = useMemo(() => parse(value), [value]);
  const ensName = parsed.kind === "name" ? parsed.name : undefined;

  const [resolution, setResolution] = useState<Resolution>();

  useEffect(() => {
    if (!ensName) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const address = await mainnetClient.getEnsAddress({
          name: normalize(ensName),
        });

        if (cancelled) return;

        setResolution(
          address
            ? { status: "resolved", name: ensName, address: getAddress(address) }
            : { status: "not-found", name: ensName },
        );
      }
      catch {
        if (!cancelled) {
          setResolution({
            status: "error",
            name: ensName,
            message: "Lookup failed — not a resolvable name, or the RPC is unreachable.",
          });
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ensName]);

  // Only trust a resolution that matches the name currently in the field;
  // anything else is a leftover from a previous input.
  const current = resolution && resolution.name === ensName ? resolution : undefined;

  const committed
    = parsed.kind === "address"
      ? {
          address: parsed.address,
          source: parsed.wasChecksummed
            ? "typed, checksum verified"
            : "typed lowercase, normalized to EIP-55",
        }
      : (parsed.kind === "name" && current?.status === "resolved"
          ? {
              address: current.address,
              source: `resolved from ${current.name} via ENS`,
            }
          : undefined);

  const status: { tone: "muted" | "success" | "destructive"; text: string; } = (() => {
    switch (parsed.kind) {
      case "empty": {
        return { tone: "muted", text: "Paste an address or type an ENS name." };
      }
      case "partial": {
        return { tone: "muted", text: "Keep typing — an address is 0x plus 40 hex characters." };
      }
      case "invalid": {
        return { tone: "destructive", text: "Not an address or ENS name." };
      }
      case "checksum-mismatch": {
        return {
          tone: "destructive",
          text: "Mixed-case address fails the EIP-55 checksum — likely a corrupted copy. Refuse it.",
        };
      }
      case "address": {
        return {
          tone: "success",
          text: parsed.wasChecksummed
            ? "Valid address, checksum verified."
            : "Valid address. Lowercase carries no checksum, so it is accepted and normalized.",
        };
      }
      case "name": {
        if (!current) return { tone: "muted", text: "Resolving name…" };

        switch (current.status) {
          case "resolved": {
            return { tone: "success", text: "Name resolved." };
          }
          case "not-found": {
            return { tone: "destructive", text: "No address is registered for this name." };
          }
          case "error": {
            return { tone: "destructive", text: current.message };
          }
        }
      }
    }
  })();

  return (
    <DemoShell
      source="components/design/address/address-input.tsx"
      controls={{
        example: {
          type: "tabs",
          options: EXAMPLES.map(entry => ({ value: entry.label, label: entry.label })),
          value: example,
          onChange: (label) => {
            const picked = EXAMPLES.find(entry => entry.label === label);

            if (!picked) return;

            setValue(sanitize(picked.value));
            setExample(label);
          },
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <Field label="Recipient">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(sanitize(e.target.value));
              setExample("");
            }}
            placeholder="0x… or name.eth"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="demo-input font-mono"
          />
        </Field>
        <p
          className={classNames("text-[13px]", {
            "text-muted": status.tone === "muted",
            "text-success": status.tone === "success",
            "text-destructive": status.tone === "destructive",
          })}
        >
          {status.text}
        </p>
        {parsed.kind === "name" && current?.status === "resolved" && (
          <div className="flex flex-col gap-1 rounded-lg border border-primary bg-surface px-3 py-2">
            <span className="text-xs text-secondary">
              {current.name}
              <span className="text-muted"> resolves to</span>
            </span>
            <span className="font-mono text-xs break-all text-primary">
              {current.address}
            </span>
          </div>
        )}
        <hr className="border-t border-primary" />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-secondary uppercase">
            What the wallet submits
          </span>
          <pre className="w-full rounded-md border border-primary bg-surface whitespace-pre-wrap wrap-anywhere">
            <code
              className={classNames(
                "block p-2 font-mono text-xs",
                committed ? "text-secondary" : "text-muted",
              )}
            >
              {committed?.address ?? "—"}
            </code>
          </pre>
          <span className="text-xs text-muted">
            {committed ? committed.source : "Nothing yet — no committable address."}
          </span>
        </div>
      </div>
    </DemoShell>
  );
};
