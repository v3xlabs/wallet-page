"use client";

import { useState } from "react";

import { formatError, getAccounts } from "../../../lib/ethereum";
import { DemoBlock } from "../../wallet/DemoBlock";
import { useDemoFrame } from "../../wallet/DemoFrame";
import { AccountsPreview } from "../../wallet/preview/AccountsPreview";
import { WalletActionPanel } from "../../wallet/preview/WalletActionPanel";
import { useWallet } from "../../wallet/WalletProvider";

export function EthAccountsDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [accounts, setAccounts] = useState<string[]>();
  const [error, setError] = useState<string>();

  const fetchAccounts = async () => {
    if (!requireSession()) return;

    setError(undefined);

    try {
      const list = await getAccounts(session.provider);

      setAccounts(list.map(String));
    }
    catch (error_) {
      setAccounts(undefined);
      setError(formatError(error_));
    }
  };

  return (
    <DemoBlock>
      <WalletActionPanel
        inspector={{
          user: (
            <AccountsPreview
              accounts={accounts ?? []}
              firstAccountHint="Typical dapp shortcut: const [address] = await eth_accounts"
            />
          ),
          request: { method: "eth_accounts", params: [] },
        }}
        response={accounts ? JSON.stringify(accounts, null, 2) : undefined}
        error={error}
        actions={[
          {
            label: "Call eth_accounts",
            onClick: fetchAccounts,
            primary: true,
          },
        ]}
      />
    </DemoBlock>
  );
}
