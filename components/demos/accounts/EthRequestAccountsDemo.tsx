"use client";

import { useState } from "react";

import { formatError, requestAccounts } from "../../../lib/ethereum";
import { AccountsPreview } from "../../wallet/preview/AccountsPreview";
import { WalletActionPanel } from "../../wallet/preview/WalletActionPanel";
import { DemoBlock } from "../../wallet/DemoBlock";
import { useDemoFrame } from "../../wallet/DemoFrame";
import { useWallet } from "../../wallet/WalletProvider";

export function EthRequestAccountsDemo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [accounts, setAccounts] = useState<string[]>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const request = async () => {
    if (!requireSession()) return;
    setPending(true);
    setError(undefined);
    try {
      const list = await requestAccounts(session.provider);
      setAccounts(list.map(String));
    }
    catch (err) {
      setAccounts(undefined);
      setError(formatError(err));
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
              firstAccountHint="Many apps only bind UI to accounts[0] and never offer the others"
            />
          ),
          request: { method: "eth_requestAccounts", params: [] },
        }}
        response={accounts ? JSON.stringify(accounts, null, 2) : undefined}
        error={error}
        pending={pending}
        actions={[
          {
            label: "Call eth_requestAccounts",
            onClick: request,
            primary: true,
          },
        ]}
      />
    </DemoBlock>
  );
}
