import classNames from "classnames";

import { truncateAddress } from "../../lib/display";

type AddressProperties = {
  address: string;
  /** Render the full address instead of the `0x225...c3B5` truncation. */
  full?: boolean;
};

/** Shared inline address display -- use this instead of wrapping addresses in `<code>`. */
export const Address = ({ address, full = false }: AddressProperties) => (
  <span className={classNames("font-mono text-control text-primary", full ? "break-all text-balance" : "whitespace-nowrap")} title={address}>
    {full ? address : truncateAddress(address)}
  </span>
);
