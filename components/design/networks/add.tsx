"use client";

import classNames from "classnames";
import type { ReactNode } from "react";
import { useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { hoodi } from "viem/chains";

import { DemoShell } from "../shell";
import {
  PrimaryButton,
  SecondaryButton,
  Spinner,
  StatusPill,
  SuccessCheck,
  TokenIcon,
  WalletFrame,
  WalletHeader,
} from "../ui";
import { HOODI_COLOR, ORIGIN, SOURCE_LABELS } from "./shared";

/**
 * What app.example.org proposes via wallet_addEthereumChain: the real Hoodi
 * chain (id, name, currency), but pointing at the app's own endpoints.
 */
const PROPOSED = {
  chain: hoodi,
  rpcUrl: "https://rpc.hoodi.example.org",
  explorerUrl: "https://explorer.hoodi.example.org",
};

type Phase = "proposal" | "adding" | "added" | "dismissed";

const FieldRow = ({ label, value, caption, pill, warn, mono }: {
  label: string;
  value: string;
  caption?: string;
  pill?: ReactNode;
  warn?: boolean;
  mono?: boolean;
}) => (
  <div className={classNames("flex flex-col gap-1 px-4 py-2.5", warn && "bg-warning-tint")}>
    <div className="flex items-start justify-between gap-3">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className="flex min-w-0 flex-col items-end gap-1">
        <span
          className={classNames(
            "max-w-full truncate font-medium text-primary tabular-nums",
            mono ? "font-mono text-xs" : "text-[13px]",
          )}
        >
          {value}
        </span>
        {pill}
      </span>
    </div>
    {caption !== undefined && (
      <span className={classNames("text-[11px]", warn ? "text-warning" : "text-muted")}>
        {caption}
      </span>
    )}
  </div>
);

const AddNetworkScreen = () => {
  const [phase, setPhase] = useState<Phase>("proposal");
  const { chain } = PROPOSED;

  const add = () => {
    setPhase("adding");
    setTimeout(() => setPhase("added"), 600);
  };

  if (phase === "added") {
    return (
      <div className="flex grow flex-col items-center justify-center gap-3 px-4 pt-6 pb-4">
        <SuccessCheck />
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-primary">
            {chain.name}
            {" "}
            added
          </span>
          <span className="text-center text-sm text-muted">
            The network is in your wallet, marked with where it came from.
          </span>
        </div>
        <div className="mt-2 flex w-full items-center gap-3 rounded-xl border border-primary bg-surfaceMuted/50 px-4 py-2.5">
          <TokenIcon symbol={chain.name} color={HOODI_COLOR} size={32} />
          <span className="flex min-w-0 grow flex-col gap-px">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-primary">{chain.name}</span>
              <StatusPill tone="info">{SOURCE_LABELS.app}</StatusPill>
            </span>
            <span className="text-xs text-muted tabular-nums">
              {chain.nativeCurrency.symbol}
              {" · id "}
              {chain.id}
            </span>
          </span>
        </div>
        <button type="button" className="demo-btn mt-2" onClick={() => setPhase("proposal")}>
          Replay request
        </button>
      </div>
    );
  }

  if (phase === "dismissed") {
    return (
      <div className="flex grow flex-col items-center justify-center gap-2 px-6 py-6 text-center">
        <span className="text-sm font-medium text-primary">Request declined</span>
        <p className="text-xs text-muted">
          {ORIGIN}
          {" "}
          was told no and nothing changed in your wallet.
        </p>
        <button type="button" className="demo-btn mt-2" onClick={() => setPhase("proposal")}>
          Replay request
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-4 pt-1 pb-3">
        <span className="flex items-center gap-2 rounded-full border border-primary bg-surfaceMuted px-3 py-1.5">
          <FiGlobe aria-hidden className="size-3.5 text-muted" />
          <span className="text-[13px] font-medium text-primary">{ORIGIN}</span>
        </span>
        <p className="text-center text-xs text-muted">
          This site wants to add a network to your wallet
          {" "}
          <span className="whitespace-nowrap">(wallet_addEthereumChain, EIP-3085)</span>
          .
        </p>
      </div>
      <div className="mx-4 divide-y divide-(--vocs-border-color-primary) overflow-hidden rounded-xl border border-primary bg-surfaceMuted/50">
        <FieldRow label="Network" value={chain.name} />
        <FieldRow
          label="Network id"
          value={`${chain.id}`}
          pill={<StatusPill tone="success">Matches public chain registry</StatusPill>}
        />
        <FieldRow
          label="RPC URL"
          value={PROPOSED.rpcUrl}
          mono
          warn
          caption="Unrecognized RPC host - requests reveal your address to this server."
        />
        <FieldRow label="Currency" value={chain.nativeCurrency.symbol} />
        <FieldRow label="Explorer" value={PROPOSED.explorerUrl} mono />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 px-4 pt-4 pb-4">
        <SecondaryButton onClick={() => setPhase("dismissed")} disabled={phase === "adding"}>
          Cancel
        </SecondaryButton>
        <PrimaryButton onClick={add} disabled={phase === "adding"}>
          {phase === "adding"
            ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Adding…
                </span>
              )
            : "Add network"}
        </PrimaryButton>
      </div>
    </>
  );
};

export const AddNetworkDemo = () => (
  <DemoShell source="components/design/networks/add.tsx">
    <WalletFrame>
      <WalletHeader title="Add network" />
      <AddNetworkScreen />
    </WalletFrame>
  </DemoShell>
);
