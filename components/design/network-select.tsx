"use client";

import { useState } from "react";
import { hoodi, mainnet, sepolia } from "viem/chains";

import { Select } from "../select";

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
  const isKnown = KNOWN_NETWORKS.some(network => network.id === value);
  const [custom, setCustom] = useState(!isKnown);

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        label="Network"
        value={custom ? CUSTOM : String(value)}
        options={[
          ...KNOWN_NETWORKS.map(network => ({ value: String(network.id), label: network.name })),
          { value: CUSTOM, label: "Custom network id..." },
        ]}
        onChange={(selected) => {
          if (selected === CUSTOM) {
            setCustom(true);

            return;
          }

          setCustom(false);
          onChange(Number(selected));
        }}
        className="demo-select"
      />
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
