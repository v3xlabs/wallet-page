import { Address } from "../../wallet/address";

type AccountsPreviewProperties = {
  accounts: string[];
  /** Label for what many dapps do with index 0 */
  firstAccountHint?: string;
};

export const AccountsPreview = ({
  accounts,
  firstAccountHint = "Many dapps and wallets only use this entry",
}: AccountsPreviewProperties) => {
  if (accounts.length === 0) {
    return <p className="text-sm text-secondary">Wallet returned an empty list.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-sm font-semibold">
        {accounts.length}
        {" "}
        account
        {accounts.length === 1 ? "" : "s"}
        {" "}
        returned
      </p>
      <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
        {accounts.map((address, index) => (
          <li key={address} className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-control text-secondary">
              accounts[
              {index}
              ]
            </span>
            <Address address={address} full />
          </li>
        ))}
      </ol>
      {accounts.length > 1 && (
        <p className="m-0 text-control text-secondary">
          {firstAccountHint}
          {" "}
          - the rest are easy to miss in UI even though the
          RPC returns them.
        </p>
      )}
    </div>
  );
};
