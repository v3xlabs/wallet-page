"use client";

import classNames from "classnames";
import type { FC, PropsWithChildren } from "react";
import { FiAlertTriangle, FiGlobe } from "react-icons/fi";

import type { Tone } from "../ui";
import { PrimaryButton, SecondaryButton, Spinner, StatusPill, SuccessCheck } from "../ui";

/**
 * Shared chrome for every signature-request sheet: who is asking, how loud
 * the risk callout is, and the reject/sign action row. Scenario bodies only
 * supply what varies — the payload rendering.
 */

/** Requesting origin plus the wallet's verdict on it. Always shown first. */
export const OriginBar: FC<{ host: string; verdict: string; tone: Tone; }> = ({
  host,
  verdict,
  tone,
}) => (
  <div className="mx-4 flex items-center gap-2.5 rounded-xl border border-primary bg-surfaceMuted/50 px-3 py-2.5">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surfaceTint text-secondary">
      <FiGlobe className="size-4" aria-hidden />
    </span>
    <span className="min-w-0 grow truncate font-mono text-[13px] text-primary">{host}</span>
    <StatusPill tone={tone}>{verdict}</StatusPill>
  </div>
);

const BANNER_TONES = {
  warning: "bg-warning-tint text-warning",
  destructive: "bg-destructive-tint text-destructive",
} as const;

/** Tinted risk callout — the one thing a confirmation sheet must never bury. */
export const SheetBanner: FC<PropsWithChildren<{ tone: keyof typeof BANNER_TONES; }>> = ({
  tone,
  children,
}) => (
  <div className={classNames("mx-4 flex items-start gap-2.5 rounded-xl px-3 py-2.5", BANNER_TONES[tone])}>
    <FiAlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
    <p className="text-xs leading-relaxed font-medium">{children}</p>
  </div>
);

/** Explicit consent gate for requests the wallet cannot vouch for. */
export const RiskCheckbox: FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({
  checked,
  onChange,
}) => (
  <label className="mx-4 flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-[13px] font-medium text-secondary select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="size-4 cursor-pointer"
      style={{ accentColor: "var(--vocs-color-red)" }}
    />
    I understand the risk
  </label>
);

/** Reject / sign pair. Reject is never disabled — bailing out is always free. */
export const SheetActions: FC<{
  onReject: () => void;
  onSign: () => void;
  signing: boolean;
  disabled?: boolean;
  destructive?: boolean;
}> = ({ onReject, onSign, signing, disabled, destructive }) => (
  <div className="flex gap-2 px-4 pt-2 pb-4">
    <SecondaryButton onClick={onReject} disabled={signing}>Reject</SecondaryButton>
    <PrimaryButton onClick={onSign} disabled={disabled || signing} destructive={destructive}>
      {signing
        ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Signing…
            </span>
          )
        : "Sign"}
    </PrimaryButton>
  </div>
);

/** Payoff frame once a signature is produced. */
export const SignedScreen: FC<{ label: string; onDone: () => void; }> = ({ label, onDone }) => (
  <div className="flex grow flex-col items-center justify-center gap-3 px-4 pt-6 pb-4">
    <SuccessCheck />
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg font-semibold text-primary">Signed</span>
      <span className="text-center text-sm text-muted">{label}</span>
    </div>
    <div className="w-full pt-3">
      <PrimaryButton onClick={onDone}>Done</PrimaryButton>
    </div>
  </div>
);
