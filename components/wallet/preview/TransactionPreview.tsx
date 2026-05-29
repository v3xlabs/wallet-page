import type { ReactNode } from "react";

import { isZeroAddress, shortAddress } from "../../../lib/display";

export type TransactionPreviewProps = {
  from: string;
  to: string;
  valueLabel?: string;
  data?: string;
  subtitle?: ReactNode;
};

export function TransactionPreview({
  from,
  to,
  valueLabel,
  data,
  subtitle,
}: TransactionPreviewProps) {
  const hasCalldata = data && data !== "0x" && data !== "0x0";

  return (
    <>
      {subtitle}
      <p className="wallet-preview-tx-route">
        <code>{shortAddress(from, 6)}</code>
        <span aria-hidden> → </span>
        <code>{isZeroAddress(to) ? "0x0…0" : shortAddress(to, 6)}</code>
      </p>
      {valueLabel && <p className="wallet-preview-tx-value">{valueLabel}</p>}
      {hasCalldata && (
        <p className="wallet-preview-tx-call">
          Contract call · <code>{data.slice(0, 10)}…</code>
        </p>
      )}
    </>
  );
}
