"use client";

import { useState } from "react";
import { mainnet } from "viem/chains";

import { NetworkSelect } from "../network-select";
import { DemoShell } from "../shell";
import { SecondaryButton, TokenIcon, WalletFrame, WalletHeader } from "../ui";
import { AccountRow, ACCOUNTS, RowGroup, SectionLabel } from "./shared";

const HOST = "app.exampleswap.org";

/**
 * A connection is one account on one chain at a time - and both stay
 * adjustable for as long as the connection lives. No disconnect/reconnect
 * dance to switch either.
 */
export const ManageConnectionDemo = () => {
  const [accountIndex, setAccountIndex] = useState(0);
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [connected, setConnected] = useState(true);

  const reset = () => {
    setConnected(true);
    setAccountIndex(0);
    setChainId(mainnet.id);
  };

  return (
    <DemoShell source="components/design/connect/manage.tsx" i18n>
      <WalletFrame>
        <WalletHeader title="Example Swap" />
        {connected
          ? (
              <div className="flex grow flex-col gap-4 px-4 pt-2 pb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <TokenIcon symbol="EXS" color="#6366f1" size={44} />
                  <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <span aria-hidden className="size-1.5 rounded-full bg-(--vocs-color-green)" />
                    Connected
                  </span>
                  <span className="font-mono text-xs text-muted">{HOST}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Account</SectionLabel>
                  <RowGroup>
                    {ACCOUNTS.map((candidate, index) => (
                      <AccountRow
                        key={candidate.address}
                        account={candidate}
                        selected={index === accountIndex}
                        onSelect={() => setAccountIndex(index)}
                      />
                    ))}
                  </RowGroup>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Network</SectionLabel>
                  <NetworkSelect value={chainId} onChange={setChainId} />
                </div>
                <div className="mt-auto pt-1">
                  <SecondaryButton onClick={() => setConnected(false)}>Disconnect</SecondaryButton>
                </div>
              </div>
            )
          : (
              <div className="flex grow flex-col items-center justify-center gap-3 px-4 pb-4">
                <TokenIcon symbol="EXS" color="#6366f1" size={44} />
                <span className="text-sm font-medium text-primary">Disconnected</span>
                <p className="text-center text-xs leading-relaxed text-muted">
                  {HOST}
                  {" "}
                  no longer sees any account. Connecting again starts from the
                  connect prompt.
                </p>
                <div className="w-full pt-2">
                  <SecondaryButton onClick={reset}>Reset demo</SecondaryButton>
                </div>
              </div>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
