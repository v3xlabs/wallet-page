"use client";

import { useState } from "react";

import { requestAccounts } from "../../../lib/ethereum";
import { AccountsPreview } from "../../wallet/preview/AccountsPreview";
import { WalletActionPanel } from "../../wallet/preview/WalletActionPanel";
import { DemoBlock } from "../../wallet/DemoBlock";
import { ResultBlock } from "../ResultBlock";
import { useWallet } from "../../wallet/WalletProvider";

export function EthRequestAccountsDemo() {
  const { session } = useWallet();
  const [accounts, setAccounts] = useState<string[]>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const request = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    try {
      const list = await requestAccounts(session.provider);
      setAccounts(list.map(String));
    }
    catch (err) {
      setAccounts(undefined);
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoBlock>
      <WalletActionPanel
        inspector={{
          user: (
            <AccountsPreview
              accounts={accounts ?? []}
              firstAccountHint="Connect flows often bind UI to accounts[0] and never offer the others"
            />
          ),
          rpc: { method: "eth_requestAccounts", params: [] },
        }}
        pending={pending}
        actions={[
          {
            label: "Call eth_requestAccounts",
            onClick: request,
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
