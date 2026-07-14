import type { ReactNode } from "react";

import { Address } from "../address";

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
      <p className="font-mono text-[13px]">
        <Address address={from} />
        <span aria-hidden> → </span>
        <Address address={to} />
      </p>
      {valueLabel && <p className="mt-1.5 font-semibold">{valueLabel}</p>}
      {hasCalldata && (
        <p className="mt-1.5 text-[13px] text-secondary">
          Contract call ·
          {" "}
          <code>
            {data.slice(0, 10)}
            …
          </code>
        </p>
      )}
    </>
  );
}
