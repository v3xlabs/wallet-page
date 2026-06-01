"use client";

import type { Hex } from "viem";

import { DEMO_CHAINS } from "../../../lib/chains";

type ChainSelectProps = {
  value: Hex;
  onChange: (chainId: Hex) => void;
  id?: string;
};

export function ChainSelect({ value, onChange, id }: ChainSelectProps) {
  return (
    <select
      id={id}
      className="wallet-demo-select"
      value={value}
      onChange={e => onChange(e.target.value as Hex)}
    >
      {DEMO_CHAINS.map(chain => (
        <option key={chain.chainId} value={chain.chainId}>
          {chain.name}
          {" "}
          (
          {chain.chainId}
          )
        </option>
      ))}
    </select>
  );
}
