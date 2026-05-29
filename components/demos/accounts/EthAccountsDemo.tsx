"use client";

import { useState } from "react";

import { getAccounts } from "../../../lib/ethereum";
import { AccountsPreview } from "../../wallet/preview/AccountsPreview";
import { WalletActionPanel } from "../../wallet/preview/WalletActionPanel";
import { DemoBlock } from "../../wallet/DemoBlock";
import { ResultBlock } from "../ResultBlock";
import { useWallet } from "../../wallet/WalletProvider";

export function EthAccountsDemo() {
  const { session } = useWallet();
  const [accounts, setAccounts] = useState<string[]>();
  const [error, setError] = useState<string>();

  const fetchAccounts = async () => {
    if (!session) return;
    setError(undefined);
    try {
      const list = await getAccounts(session.provider);
      setAccounts(list.map(String));
    }
    catch (err) {
      setAccounts(undefined);
      setError(err instanceof Error ? err.message : String(err));
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
          rpc: { method: "eth_accounts", params: [] },
        }}
        actions={[
          {
            label: "Call eth_accounts",
            onClick: fetchAccounts,
            primary: true,
          },
        ]}
      >
        <ResultBlock
          label="Raw JSON"
          value={accounts ? JSON.stringify(accounts, null, 2) : undefined}
          error={error}
        />
      </WalletActionPanel>
    </DemoBlock>
  );
}
