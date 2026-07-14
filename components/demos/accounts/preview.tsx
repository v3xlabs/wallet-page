import classNames from "classnames";

import { Address } from "../../wallet/address";

type AccountsPreviewProps = {
  accounts: string[];
  /** Label for what many dapps do with index 0 */
  firstAccountHint?: string;
};

export function AccountsPreview({
  accounts,
  firstAccountHint = "Many dapps and wallets only use this entry",
}: AccountsPreviewProps) {
  if (accounts.length === 0) {
    return <p className="text-sm text-secondary">Wallet returned an empty list.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        {accounts.length}
        {" "}
        account
        {accounts.length === 1 ? "" : "s"}
        {" "}
        returned
      </p>
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {accounts.map((address, index) => (
          <li
            key={address}
            className={classNames(
              "flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border p-2",
              index === 0
                ? "border-accent bg-accent/10"
                : "border-primary bg-code-block",
            )}
          >
            <span className="inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded bg-surfaceMuted font-mono text-xs font-semibold">{index}</span>
            <Address address={address} full />
            {index === 0
              ? (
                  <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    accounts[0]
                  </span>
                )
              : (
                  <span className="rounded-full bg-surfaceMuted px-1.5 py-0.5 text-xs text-secondary">
                    accounts[
                    {index}
                    ]
                  </span>
                )}
          </li>
        ))}
      </ol>
      {accounts.length > 1 && (
        <p className="mt-2 text-[13px] leading-snug text-secondary">
          {firstAccountHint}
          {" "}
          — the rest are easy to miss in UI even though the
          RPC returns them.
        </p>
      )}
    </div>
  );
}
