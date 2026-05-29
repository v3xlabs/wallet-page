import type { Address } from "viem";

import { formatDeadline, formatTokenAmount, shortAddress } from "../../../lib/display";
import { TokenIcon } from "./TokenIcon";

type PermitPreviewProps = {
  tokenName: string;
  tokenSymbol: string;
  decimals?: number;
  value: bigint;
  spender: Address;
  deadline: bigint;
};

export function PermitPreview({
  tokenName,
  tokenSymbol,
  decimals = 6,
  value,
  spender,
  deadline,
}: PermitPreviewProps) {
  const amount = formatTokenAmount(value, decimals, tokenSymbol);

  return (
    <div className="wallet-preview-permit">
      <div className="wallet-preview-permit-hero">
        <TokenIcon symbol={tokenSymbol} name={tokenName} />
        <div>
          <p className="wallet-preview-permit-amount">{amount}</p>
          <p className="wallet-preview-permit-token">
            to <code>{shortAddress(spender)}</code> · until {formatDeadline(deadline)}
          </p>
        </div>
      </div>
    </div>
  );
}
