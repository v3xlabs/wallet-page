"use client";

import classNames from "classnames";
import type { FC, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiEdit3, FiEye, FiSend } from "react-icons/fi";
import type { Address } from "viem";

import { fiatValue, formatUsd, SELF, TOKENS } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";
import type { Tone } from "../ui";
import {
  PrimaryButton,
  SecondaryButton,
  Spinner,
  StatusPill,
  TokenIcon,
  WalletFrame,
  WalletHeader,
} from "../ui";

const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

type Account = { name: string; address: Address; balanceUsd: number; };

const ACCOUNTS: Account[] = [
  {
    name: SELF.name,
    address: SELF.address,
    balanceUsd: TOKENS.reduce((sum, token) => sum + fiatValue(token, token.balance), 0),
  },
  {
    name: "Account 2",
    address: "0x3f8CBe7177E4cC2Cb1f9AB1e26dA5F2b84942A6d",
    balanceUsd: 1240.18,
  },
];

/** What connecting actually grants — spelled out, never implied. */
const PERMISSIONS: { icon: IconType; label: string; caption: string; }[] = [
  { icon: FiEye, label: "See your address & balances", caption: "Read-only — it cannot move funds" },
  { icon: FiSend, label: "Propose transactions", caption: "Always with your confirmation" },
  { icon: FiEdit3, label: "Request signatures", caption: "Always with your confirmation" },
];

const NETWORKS: { name: string; color: string; }[] = [
  { name: "Ethereum", color: "#627eea" },
];

type Scenario = "trusted" | "lookalike";

const APPS: Record<Scenario, {
  label: string;
  name: string;
  host: string;
  verdict: string;
  verdictTone: Tone;
  /** A blocked origin never gets a live Connect button. */
  blocked?: boolean;
}> = {
  trusted: {
    label: "Trusted app",
    name: "Example Swap",
    host: "app.exampleswap.org",
    verdict: "Known app",
    verdictTone: "success",
  },
  lookalike: {
    label: "Lookalike origin",
    name: "Example Swap",
    host: "app.exampieswap.org",
    verdict: "Suspicious origin",
    verdictTone: "destructive",
    blocked: true,
  },
};

const OPTIONS = (Object.keys(APPS) as Scenario[]).map(value => ({
  value,
  label: APPS[value].label,
}));

const SectionLabel: FC<PropsWithChildren> = ({ children }) => (
  <span className="px-1 text-[11px] font-medium tracking-wide text-muted uppercase">
    {children}
  </span>
);

const AccountRow = ({ account, selected, onSelect }: {
  account: Account;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={classNames(
      "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors",
      selected ? "bg-accenta2" : "hover:bg-surfaceMuted",
    )}
  >
    <EnsAvatar
      address={account.address}
      name={account.name.includes(".") ? account.name : undefined}
      size={32}
    />
    <span className="flex min-w-0 grow flex-col gap-px">
      <span className="truncate text-sm font-medium text-primary">{account.name}</span>
      <span className="font-mono text-[11px] text-muted">{truncate(account.address)}</span>
    </span>
    <span className="text-xs text-secondary tabular-nums">{formatUsd(account.balanceUsd)}</span>
    <span
      className={classNames(
        "flex size-4 shrink-0 items-center justify-center rounded-full border",
        selected ? "border-accent" : "border-primary",
      )}
      aria-hidden
    >
      {selected && <span className="size-2 rounded-full bg-accent" />}
    </span>
  </button>
);

type Phase = "prompt" | "connecting" | "connected";

export const ConnectDemo = () => {
  const [scenario, setScenario] = useState<Scenario>("trusted");
  const [phase, setPhase] = useState<Phase>("prompt");
  const [accountIndex, setAccountIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reset = () => {
    clearTimeout(timer.current);
    setPhase("prompt");
    setAccountIndex(0);
  };

  const switchScenario = (next: Scenario) => {
    reset();
    setScenario(next);
  };

  const connect = () => {
    setPhase("connecting");
    timer.current = setTimeout(() => setPhase("connected"), 600);
  };

  const app = APPS[scenario];
  const account = ACCOUNTS[accountIndex];

  return (
    <DemoShell
      source="components/design/connect/connect.tsx"
      controls={{
        Scenario: {
          type: "tabs",
          options: OPTIONS,
          value: scenario,
          onChange: value => switchScenario(value as Scenario),
        },
      }}
    >
      <WalletFrame className="min-h-[480px]">
        <WalletHeader title={phase === "connected" ? app.name : "Connect"} />
        {phase === "connected"
          ? (
              <div className="flex grow flex-col items-center justify-center gap-4 px-4 pt-4 pb-4">
                <TokenIcon symbol="EXS" color="#6366f1" size={48} />
                <div className="flex flex-col items-center gap-1.5">
                  <StatusPill tone="success">Connected</StatusPill>
                  <span className="font-mono text-xs text-muted">{app.host}</span>
                </div>
                <div className="w-full rounded-xl border border-primary bg-surfaceMuted/50">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <EnsAvatar
                      address={account.address}
                      name={account.name.includes(".") ? account.name : undefined}
                      size={32}
                    />
                    <span className="flex min-w-0 grow flex-col gap-px">
                      <span className="truncate text-sm font-medium text-primary">{account.name}</span>
                      <span className="font-mono text-[11px] text-muted">{truncate(account.address)}</span>
                    </span>
                    <span className="text-xs text-secondary tabular-nums">
                      {formatUsd(account.balanceUsd)}
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs leading-relaxed text-muted">
                  The app sees this account on Ethereum. It still cannot move anything
                  without your confirmation.
                </p>
                <div className="w-full pt-1">
                  <SecondaryButton onClick={reset}>Disconnect</SecondaryButton>
                </div>
              </div>
            )
          : (
              <div className="flex grow flex-col gap-4 px-4 pt-1 pb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <TokenIcon symbol="EXS" color="#6366f1" size={44} />
                  <span className="text-base font-semibold text-primary">{app.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">{app.host}</span>
                    <StatusPill tone={app.verdictTone}>{app.verdict}</StatusPill>
                  </span>
                </div>
                {app.blocked && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-destructive-tint px-3 py-2.5 text-destructive">
                    <FiAlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <p className="text-xs leading-relaxed font-medium">
                      This origin is one letter away from app.exampleswap.org — an “i” where the
                      “l” should be. A good wallet cross-checks origins against known-app
                      registries and blocks lookalikes.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>This app will be able to</SectionLabel>
                  <div className="divide-y divide-(--vocs-border-color-primary) rounded-xl border border-primary bg-surfaceMuted/50">
                    {PERMISSIONS.map(permission => (
                      <div key={permission.label} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surfaceTint text-secondary">
                          <permission.icon className="size-4" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-col gap-px">
                          <span className="text-[13px] font-medium text-primary">{permission.label}</span>
                          <span className="text-[11px] text-muted">{permission.caption}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Connect with</SectionLabel>
                  <div className="divide-y divide-(--vocs-border-color-primary) overflow-hidden rounded-xl border border-primary bg-surfaceMuted/50">
                    {ACCOUNTS.map((candidate, index) => (
                      <AccountRow
                        key={candidate.address}
                        account={candidate}
                        selected={index === accountIndex}
                        onSelect={() => setAccountIndex(index)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Networks</SectionLabel>
                  <div className="flex gap-1.5 px-1">
                    {NETWORKS.map(network => (
                      <span
                        key={network.name}
                        className="flex items-center gap-1.5 rounded-full border border-primary bg-surfaceMuted px-2.5 py-1 text-xs font-medium text-secondary"
                      >
                        <span
                          aria-hidden
                          className="size-2 rounded-full"
                          style={{ background: network.color }}
                        />
                        {network.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <SecondaryButton onClick={reset} disabled={phase === "connecting"}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={connect}
                      disabled={app.blocked || phase === "connecting"}
                    >
                      {phase === "connecting"
                        ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner />
                              Connecting…
                            </span>
                          )
                        : "Connect"}
                    </PrimaryButton>
                  </div>
                  {app.blocked && (
                    <p className="text-center text-xs font-medium text-destructive">
                      Blocked by your wallet
                    </p>
                  )}
                </div>
              </div>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
