import { truncateAddress } from "../../lib/display";

type AddressProps = {
  address: string;
  /** Render the full address instead of the `0x225...c3B5` truncation. */
  full?: boolean;
};

/** Shared inline address display — use this instead of wrapping addresses in `<code>`. */
export const Address = ({ address, full = false }: AddressProps) => (
  <span className="font-mono text-[0.85em] break-all text-primary" title={address}>
    {full ? address : truncateAddress(address)}
  </span>
);
