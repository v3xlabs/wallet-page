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
    return <p className="wallet-demo-muted">Wallet returned an empty list.</p>;
  }

  return (
    <div className="wallet-preview-accounts">
      <p className="wallet-preview-accounts-count">
        {accounts.length}
        {" "}
        account
        {accounts.length === 1 ? "" : "s"}
        {" "}
        returned
      </p>
      <ol className="wallet-preview-account-list">
        {accounts.map((address, index) => (
          <li
            key={address}
            className={
              index === 0
                ? "wallet-preview-account-item wallet-preview-account-first"
                : "wallet-preview-account-item"
            }
          >
            <span className="wallet-preview-account-index">{index}</span>
            <code>{address}</code>
            {index === 0
              ? (
                  <span className="wallet-preview-account-tag wallet-preview-account-tag-primary">
                    accounts[0]
                  </span>
                )
              : (
                  <span className="wallet-preview-account-tag">
                    accounts[
                    {index}
                    ]
                  </span>
                )}
          </li>
        ))}
      </ol>
      {accounts.length > 1 && (
        <p className="wallet-demo-muted wallet-preview-accounts-note">
          {firstAccountHint}
          {" "}
          — the rest are easy to miss in UI even though the
          RPC returns them.
        </p>
      )}
    </div>
  );
}
