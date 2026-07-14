"use client";

import { useEffect, useMemo, useState } from "react";
import { type Address, getAddress, isAddress } from "viem";

import { mainnetClient } from "../client";
import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";
import { Field } from "../ui";

type TruncationStyle = "5-4" | "6-6" | "full";

const STYLES: { value: TruncationStyle; label: string; }[] = [
  { value: "5-4", label: "5..4" },
  { value: "6-6", label: "6..6" },
  { value: "full", label: "Full" },
];

const truncate = (address: Address, style: TruncationStyle) => {
  switch (style) {
    case "5-4": {
      return `${address.slice(0, 5)}...${address.slice(-4)}`;
    }
    case "6-6": {
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }
    case "full": {
      return address;
    }
  }
};

const AddressChip = ({ address, style, onCopy, copied }: {
  address: Address;
  style: TruncationStyle;
  onCopy: () => void;
  copied: boolean;
}) => (
  <button
    type="button"
    onClick={onCopy}
    title={address}
    className="cursor-pointer rounded-md border border-primary bg-surfaceMuted px-1.5 py-0.5 text-left font-mono text-xs break-all text-secondary transition-colors hover:bg-surfaceTint hover:text-primary"
  >
    {copied ? "Copied full address" : truncate(address, style)}
  </button>
);

export const AddressDisplayDemo = () => {
  const [input, setInput] = useState("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  const [style, setStyle] = useState<TruncationStyle>("5-4");

  const address = useMemo(
    () => (isAddress(input.trim(), { strict: false }) ? getAddress(input.trim()) : undefined),
    [input],
  );

  const [reverse, setReverse] = useState<{ address: Address; name: string | null; }>();

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const primaryName = await mainnetClient.getEnsName({ address });

        if (!cancelled) setReverse({ address, name: primaryName });
      }
      catch {
        // Reverse resolution is decoration; the address stands on its own.
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address]);

  // Ignore lookups that belong to a previously entered address.
  const name = reverse && reverse.address === address ? reverse.name : null;

  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!address) return;

    void navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DemoShell
      source="components/design/address/address-display.tsx"
      controls={{
        truncation: {
          type: "select",
          label: "Truncation",
          options: STYLES,
          value: style,
          onChange: value => setStyle(value as TruncationStyle),
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <Field label="Address">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            className="demo-input font-mono"
          />
        </Field>
        <hr className="border-t border-primary" />
        {address
          ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-primary bg-surface px-3 py-2.5">
                  <EnsAvatar address={address} name={name ?? undefined} size={32} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-primary">
                      {name ?? "Account"}
                    </span>
                    <AddressChip address={address} style={style} onCopy={copy} copied={copied} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-primary bg-surface px-3 py-2.5 text-sm text-secondary">
                  <span>
                    Sent
                    {" "}
                    <span className="font-medium text-primary">0.1 ETH</span>
                    {" "}
                    to
                  </span>
                  {name && <span className="font-medium text-primary">{name}</span>}
                  <AddressChip address={address} style={style} onCopy={copy} copied={copied} />
                </div>
              </div>
            )
          : (
              <p className="text-[13px] text-muted">
                Enter a valid address to preview how it renders.
              </p>
            )}
      </div>
    </DemoShell>
  );
};
