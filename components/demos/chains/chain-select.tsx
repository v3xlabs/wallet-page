"use client";

import type { Hex } from "viem";

import { DEMO_CHAINS } from "../../../lib/chains";
import { Select } from "../../select";

type ChainSelectProperties = {
  value: Hex;
  onChange: (chainId: Hex) => void;
  id?: string;
};

export const ChainSelect = ({ value, onChange, id }: ChainSelectProperties) => (
  <Select
    label="Chain"
    id={id}
    value={value}
    options={DEMO_CHAINS.map(chain => ({ value: chain.chainId, label: chain.name, detail: chain.chainId }))}
    onChange={onChange}
    className="demo-select mt-2 max-w-[22rem]"
  />
);
