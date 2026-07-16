"use client";

import classNames from "classnames";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiEdit3, FiEye, FiLayers, FiPlusCircle, FiSend } from "react-icons/fi";
import { mainnet } from "viem/chains";

import { EnsAvatar } from "../ens-avatar";
import { KNOWN_NETWORKS, NetworkSelect } from "../network-select";
import { DemoShell } from "../shell";
import {
  PrimaryButton,
  SecondaryButton,
  Spinner,
  TokenIcon,
  WalletFrame,
  WalletHeader,
} from "../ui";
import { AccountRow, ACCOUNTS, RowGroup, SectionLabel, truncate } from "./shared";

/**
 * Baseline grant behind `eth_accounts` - what every connection means,
 * spelled out, never implied.
 */
const BASE_PERMISSIONS: { icon: IconType; label: string; caption: string; }[] = [
  { icon: FiEye, label: "See your address & balances", caption: "Read-only - it cannot move funds" },
  { icon: FiSend, label: "Propose transactions", caption: "Always with your confirmation" },
  { icon: FiEdit3, label: "Request signatures", caption: "Always with your confirmation" },
];

/**
 * Extra capabilities this app explicitly asked for (EIP-2255
 * wallet_requestPermissions). Each is granted individually - the user can
 * decline any of them and still connect.
 */
const REQUESTED_PERMISSIONS: { capability: string; icon: IconType; label: string; caption: string; }[] = [
  {
    capability: "wallet_sendCalls",
    icon: FiLayers,
    label: "Batch transactions",
    caption: "Submit several actions as one - each batch still needs your confirmation",
  },
  {
    capability: "wallet_watchAsset",
    icon: FiPlusCircle,
    label: "Suggest assets",
    caption: "Propose assets for your asset list - you approve each one",
  },
];

type Scenario = "first" | "returning" | "suspicious";

const APPS: Record<Scenario, {
  label: string;
  name: string;
  host: string;
  /** The wallet remembers granting this origin a connection before. */
  connectedBefore?: boolean;
  /** Scores as a near-match of an origin the user has connected to. */
  similarTo?: string;
}> = {
  first: {
    label: "First visit",
    name: "Example Swap",
    host: "app.exampleswap.org",
  },
  returning: {
    label: "Connected before",
    name: "Example Swap",
    host: "app.exampleswap.org",
    connectedBefore: true,
  },
  suspicious: {
    label: "Suspicious origin",
    name: "Example Swap",
    host: "app.exampieswap.org",
    similarTo: "app.exampleswap.org",
  },
};

const OPTIONS = (Object.keys(APPS) as Scenario[]).map(value => ({
  value,
  label: APPS[value].label,
}));

const Toggle: FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={classNames(
      "relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
      checked ? "bg-accent" : "bg-surfaceTint",
    )}
  >
    <span
      className={classNames(
        "absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform",
        checked && "translate-x-4",
      )}
    />
  </button>
);

const PermissionRow: FC<{
  icon: IconType;
  label: string;
  caption: string;
  toggle?: { checked: boolean; onChange: (checked: boolean) => void; };
}> = ({ icon: Icon, label, caption, toggle }) => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surfaceTint text-secondary">
      <Icon className="size-4" aria-hidden />
    </span>
    <span className="flex min-w-0 grow flex-col gap-px">
      <span className="text-[13px] font-medium text-primary">{label}</span>
      <span className="text-[11px] text-muted">{caption}</span>
    </span>
    {toggle && <Toggle checked={toggle.checked} onChange={toggle.onChange} label={label} />}
  </div>
);

/** Identity block shown at the top of the prompt: app, origin, history. */
const AppIdentity: FC<{ app: (typeof APPS)[Scenario]; }> = ({ app }) => (
  <div className="flex flex-col items-center gap-1.5">
    <TokenIcon symbol="EXS" color="#6366f1" size={44} />
    <span className="text-base font-semibold text-primary">{app.name}</span>
    <span className="font-mono text-xs text-muted">{app.host}</span>
    {app.connectedBefore && (
      <span className="text-[11px] text-muted">You’ve connected to this app before</span>
    )}
  </div>
);

const SimilarityWarning: FC<{ host: string; similarTo: string; }> = ({ host, similarTo }) => (
  <div className="flex items-start gap-2.5 rounded-xl bg-warning-tint px-3 py-2.5 text-warning">
    <FiAlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
    <p className="text-xs leading-relaxed font-medium">
      {`${host} looks confusingly similar to ${similarTo}, which you’ve connected to before. If you meant that app, this isn’t it.`}
    </p>
  </div>
);

const networkName = (id: number) =>
  KNOWN_NETWORKS.find(network => network.id === id)?.name ?? `Chain ${id}`;

type Phase = "account" | "permissions" | "connecting" | "connected";

const grantAll = () =>
  Object.fromEntries(REQUESTED_PERMISSIONS.map(permission => [permission.capability, true]));

export const ConnectDemo = () => {
  const [scenario, setScenario] = useState<Scenario>("first");
  const [phase, setPhase] = useState<Phase>("account");
  const [accountIndex, setAccountIndex] = useState(0);
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [granted, setGranted] = useState<Record<string, boolean>>(grantAll);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reset = () => {
    clearTimeout(timer.current);
    setPhase("account");
    setAccountIndex(0);
    setChainId(mainnet.id);
    setGranted(grantAll());
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
      i18n
      controls={{
        Scenario: {
          type: "tabs",
          options: OPTIONS,
          value: scenario,
          onChange: value => switchScenario(value as Scenario),
        },
      }}
    >
      <WalletFrame>
        {phase === "connected" && (
          <>
            <WalletHeader title={app.name} />
            <div className="flex grow flex-col items-center justify-center gap-4 px-4 pt-4 pb-4">
              <TokenIcon symbol="EXS" color="#6366f1" size={48} />
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <span aria-hidden className="size-1.5 rounded-full bg-(--vocs-color-green)" />
                  Connected
                </span>
                <span className="font-mono text-xs text-muted">{app.host}</span>
              </div>
              <RowGroup>
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
                  <span className="text-xs text-secondary">{networkName(chainId)}</span>
                </div>
              </RowGroup>
              <p className="text-center text-xs leading-relaxed text-muted">
                The app sees this account on
                {" "}
                {networkName(chainId)}
                . It still cannot move anything
                without your confirmation.
              </p>
              <div className="w-full pt-1">
                <SecondaryButton onClick={reset}>Disconnect</SecondaryButton>
              </div>
            </div>
          </>
        )}
        {phase === "account" && (
          <>
            <WalletHeader title="Connect" />
            <div className="flex grow flex-col gap-4 px-4 pt-1 pb-4">
              <AppIdentity app={app} />
              {app.similarTo && <SimilarityWarning host={app.host} similarTo={app.similarTo} />}
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Connect with</SectionLabel>
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
              <div className="mt-auto flex gap-2 pt-2">
                <SecondaryButton onClick={reset}>Cancel</SecondaryButton>
                <PrimaryButton onClick={() => setPhase("permissions")}>Continue</PrimaryButton>
              </div>
            </div>
          </>
        )}
        {(phase === "permissions" || phase === "connecting") && (
          <>
            <WalletHeader title="Permissions" onBack={() => setPhase("account")} />
            <div className="flex grow flex-col gap-4 px-4 pt-1 pb-4">
              <div className="flex items-center justify-center gap-2">
                <EnsAvatar
                  address={account.address}
                  name={account.name.includes(".") ? account.name : undefined}
                  size={20}
                />
                <span className="text-sm font-medium text-primary">{account.name}</span>
                <span className="text-sm text-muted">→</span>
                <span className="font-mono text-xs text-muted">{app.host}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>This app will be able to</SectionLabel>
                <RowGroup>
                  {BASE_PERMISSIONS.map(permission => (
                    <PermissionRow key={permission.label} {...permission} />
                  ))}
                </RowGroup>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Also requested</SectionLabel>
                <RowGroup>
                  {REQUESTED_PERMISSIONS.map(permission => (
                    <PermissionRow
                      key={permission.capability}
                      icon={permission.icon}
                      label={permission.label}
                      caption={permission.caption}
                      toggle={{
                        checked: granted[permission.capability] ?? false,
                        onChange: checked =>
                          setGranted(previous => ({ ...previous, [permission.capability]: checked })),
                      }}
                    />
                  ))}
                </RowGroup>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Network</SectionLabel>
                <NetworkSelect value={chainId} onChange={setChainId} />
              </div>
              <div className="mt-auto flex gap-2 pt-2">
                <SecondaryButton onClick={reset} disabled={phase === "connecting"}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={connect} disabled={phase === "connecting"}>
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
            </div>
          </>
        )}
      </WalletFrame>
    </DemoShell>
  );
};
