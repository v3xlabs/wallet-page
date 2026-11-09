import type { ReactNode } from "react";

import { Address } from "../address";

export type TransactionPreviewProps = {
  from: string;
  to: string;
  valueLabel?: string;
  data?: string;
  subtitle?: ReactNode;
};

export const TransactionPreview = ({
  from,
  to,
  valueLabel,
  data,
  subtitle,
}: TransactionPreviewProps) => {
  const hasCalldata = data && data !== "0x" && data !== "0x0";

  return (
    <div className="flex flex-col gap-2">
      {subtitle}
      <p className="font-mono text-control">
        <Address address={from} />
        <span aria-hidden> → </span>
        <Address address={to} />
      </p>
      {valueLabel && <p className="font-semibold">{valueLabel}</p>}
      {hasCalldata && (
        <p className="text-control text-secondary">
          Contract call -
          {" "}
          <span className="font-mono">
            {data.slice(0, 10)}
            ...
          </span>
        </p>
      )}
    </div>
  );
};
