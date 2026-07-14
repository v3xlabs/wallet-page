"use client";

import { useState } from "react";
import { hoodi, mainnet, sepolia } from "viem/chains";

/** The demo networks: mainnet plus the two public testnets. */
export const KNOWN_NETWORKS = [mainnet, sepolia, hoodi];

const CUSTOM = "custom";

/**
 * Shared network selector: the known networks by name, or any chain by id.
 * A wallet should never gate features on a hardcoded network list.
 */
export const NetworkSelect = ({ value, onChange }: {
  value: number;
  onChange: (id: number) => void;
}) => {
  const known = KNOWN_NETWORKS.some(network => network.id === value);
  const [custom, setCustom] = useState(!known);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <select
          value={custom ? CUSTOM : value}
          onChange={(e) => {
            if (e.target.value === CUSTOM) {
              setCustom(true);

              return;
            }

            setCustom(false);
            onChange(Number(e.target.value));
          }}
          className="demo-select appearance-none pr-9"
        >
          {KNOWN_NETWORKS.map(network => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
          <option value={CUSTOM}>Custom network id…</option>
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {custom && (
        <input
          type="number"
          min={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          placeholder="Network id"
          className="demo-input font-mono"
        />
      )}
    </div>
  );
};
