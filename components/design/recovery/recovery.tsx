"use client";

import classNames from "classnames";
import type { ReactNode } from "react";
import { useState } from "react";
import { FiChevronDown, FiKey, FiPlus, FiSmartphone, FiUsers } from "react-icons/fi";
import type { Address } from "viem";

import { CONTACTS } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";
import type { Tone } from "../ui";
import {
  PrimaryButton,
  SecondaryButton,
  Spinner,
  WalletFrame,
  WalletHeader,
} from "../ui";

const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

const RING_RADIUS = 26;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Animated arc: how many protections are active, legible at a glance. */
const ScoreRing = ({ active, total }: { active: number; total: number; }) => (
  <span
    className={classNames(
      "relative block size-16 shrink-0 transition-colors",
      active === total ? "text-success" : "text-warning",
    )}
  >
    <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
      <circle
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="6"
      />
      <circle
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={RING_LENGTH}
        strokeDashoffset={RING_LENGTH * (1 - active / total)}
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary tabular-nums">
      {active}
      /
      {total}
    </span>
  </span>
);

const ICON_TONES: Record<Tone, string> = {
  muted: "bg-surfaceMuted text-secondary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  destructive: "bg-destructive-tint text-destructive",
  info: "bg-info-tint text-info",
};

const ProtectionRow = ({ icon, tone, title, caption, expanded, onToggle, children }: {
  icon: ReactNode;
  tone: Tone;
  title: string;
  caption: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div className="flex flex-col">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surfaceMuted"
    >
      <span
        className={classNames(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          ICON_TONES[tone],
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 grow flex-col gap-px">
        <span className="text-sm font-medium text-primary">{title}</span>
        <span className="truncate text-xs text-muted">{caption}</span>
      </span>
      <FiChevronDown
        className={classNames(
          "size-4 shrink-0 text-muted transition-transform",
          expanded && "rotate-180",
        )}
      />
    </button>
    {expanded && <div className="flex flex-col gap-2.5 pr-4 pb-4 pl-15">{children}</div>}
  </div>
);

type Section = "phrase" | "passkey" | "guardians";

export const RecoveryDemo = () => {
  const [expanded, setExpanded] = useState<Section>();

  const [verifiedWhen, setVerifiedWhen] = useState("3 months ago");
  const [reverifying, setReverifying] = useState(false);

  const [passkey, setPasskey] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);

  const [guardians, setGuardians] = useState([CONTACTS[1], CONTACTS[2]]);

  const active = 2 + (passkey ? 1 : 0);

  const toggle = (section: Section) =>
    setExpanded(current => (current === section ? undefined : section));

  const reverify = () => {
    setReverifying(true);
    setTimeout(() => {
      setReverifying(false);
      setVerifiedWhen("just now");
    }, 600);
  };

  const addPasskey = () => {
    setAddingPasskey(true);
    setTimeout(() => {
      setAddingPasskey(false);
      setPasskey(true);
    }, 600);
  };

  return (
    <DemoShell source="components/design/recovery/recovery.tsx">
      <WalletFrame className="min-h-[440px]">
        <WalletHeader title="Security checkup" />
        <div className="flex items-center gap-4 px-5 pt-2 pb-4">
          <ScoreRing active={active} total={3} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={classNames(
                "text-sm font-semibold transition-colors",
                active === 3 ? "text-success" : "text-warning",
              )}
            >
              {active === 3 ? "Fully protected" : "Good — 1 step left"}
            </span>
            <span className="text-xs text-muted">
              {active}
              {" "}
              of 3 protections active
            </span>
          </div>
        </div>
        <div className="flex grow flex-col divide-y divide-(--vocs-border-color-primary) border-t border-primary">
          <ProtectionRow
            icon={<FiKey className="size-4" />}
            tone="success"
            title="Recovery phrase"
            caption={`Backed up · verified ${verifiedWhen}`}
            expanded={expanded === "phrase"}
            onToggle={() => toggle("phrase")}
          >
            <p className="text-xs leading-relaxed text-secondary">
              Twelve words on paper are the root of this account. Re-check your copy now and
              then — before you need it.
            </p>
            <SecondaryButton onClick={reverify} disabled={reverifying}>
              {reverifying
                ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Checking…
                    </span>
                  )
                : "Re-verify"}
            </SecondaryButton>
          </ProtectionRow>
          <ProtectionRow
            icon={<FiSmartphone className="size-4" />}
            tone={passkey ? "success" : "warning"}
            title="Second device passkey"
            caption={passkey ? "Configured · this laptop" : "Not set up"}
            expanded={expanded === "passkey"}
            onToggle={() => toggle("passkey")}
          >
            <p className="text-xs leading-relaxed text-secondary">
              A passkey on a second device can approve recovery if this phone is ever lost.
            </p>
            {passkey
              ? (
                  <p className="rounded-lg bg-success-tint px-3 py-2 text-xs text-success">
                    Added — this device can now approve recovery.
                  </p>
                )
              : (
                  <PrimaryButton onClick={addPasskey} disabled={addingPasskey}>
                    {addingPasskey
                      ? (
                          <span className="flex items-center justify-center gap-2">
                            <Spinner />
                            Waiting for device…
                          </span>
                        )
                      : "Add device"}
                  </PrimaryButton>
                )}
          </ProtectionRow>
          <ProtectionRow
            icon={<FiUsers className="size-4" />}
            tone={guardians.length === 3 ? "success" : "info"}
            title="Guardians"
            caption={`${guardians.length} of 3 configured`}
            expanded={expanded === "guardians"}
            onToggle={() => toggle("guardians")}
          >
            {guardians.map(guardian => (
              <div key={guardian.address} className="flex items-center gap-2.5">
                <EnsAvatar address={guardian.address} name={guardian.name} size={28} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium text-primary">{guardian.name}</span>
                  <span className="font-mono text-[11px] text-muted" title={guardian.address}>
                    {truncate(guardian.address)}
                  </span>
                </span>
              </div>
            ))}
            {guardians.length < 3 && (
              <button
                type="button"
                onClick={() => setGuardians(current => [...current, CONTACTS[2]])}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary px-3 py-2 text-xs font-medium text-secondary transition-colors hover:bg-surfaceMuted hover:text-primary"
              >
                <FiPlus className="size-3.5" />
                Add a third guardian
              </button>
            )}
            <p className="text-xs leading-relaxed text-muted">
              Any two guardians together can restore access. No single guardian can act alone.
            </p>
          </ProtectionRow>
        </div>
        <p className="border-t border-primary px-5 py-3 text-center text-[11px] leading-relaxed text-muted">
          Recovery must be legible — a user should always know exactly what protects their
          account.
        </p>
      </WalletFrame>
    </DemoShell>
  );
};
