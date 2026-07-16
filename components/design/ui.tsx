"use client";

import { blo } from "blo";
import classNames from "classnames";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { useState } from "react";

/**
 * Shared primitives for the design-section demos. Every demo composes these
 * so the whole section reads as one wallet, not a pile of unrelated mockups.
 */

/** Labelled form control used in demo control panels. */
export const Field: FC<PropsWithChildren<{ label: string; }>> = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-wide text-secondary uppercase">{label}</span>
    {children}
  </label>
);

/** Segmented control for switching demo variants. */
export const Segmented = <T extends string>({ options, value, onChange, fit }: {
  options: { value: T; label: string; }[];
  value: T;
  onChange: (value: T) => void;
  fit?: boolean;
}) => (
  <div
    className={classNames(
      "grid auto-cols-fr grid-flow-col gap-0.5 rounded-lg border border-primary bg-surfaceMuted p-0.5",
      fit && "w-fit",
    )}
  >
    {options.map(option => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={classNames(
          "cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          option.value === value
            ? "bg-surface text-primary"
            : "text-secondary hover:text-primary",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * Circular token mark. With a contract address it loads the local artwork
 * (`/assets/<address>.svg`); otherwise - or when no artwork exists - it
 * falls back to a brand-colored disc with the ticker's first letter.
 */
export const TokenIcon: FC<{ symbol: string; color: string; size?: number; address?: string; }> = ({
  symbol,
  color,
  size = 32,
  address,
}) => {
  const [failed, setFailed] = useState(false);

  if (address && !failed) {
    return (
      <img
        src={`/assets/${address.toLowerCase()}.svg`}
        alt=""
        aria-hidden
        onError={() => setFailed(true)}
        // A 404 can finish before hydration attaches onError - catch it here.
        ref={(node) => {
          if (node?.complete && node.naturalWidth === 0) setFailed(true);
        }}
        className="shrink-0 rounded-full select-none"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, oklch(from ${color} calc(l + 0.12) c h), ${color} 60%, oklch(from ${color} calc(l - 0.08) c h))`,
        textShadow: "0 1px 2px rgb(0 0 0 / 0.25)",
      }}
    >
      {symbol.replace(/^W/, "").slice(0, 1)
        .toUpperCase()}
    </span>
  );
};

/** Deterministic blockie for an address - same address, same face. */
export const AddressAvatar: FC<{ address: string; size?: number; }> = ({ address, size = 32 }) => (
  <img
    src={blo(address as `0x${string}`)}
    alt=""
    aria-hidden
    className="block shrink-0 rounded-full select-none"
    style={{ width: size, height: size }}
  />
);

/**
 * Phone-shaped wallet mock. Demos render wallet screens inside this frame so
 * examples look like a product, not a form playground.
 */
export const WalletFrame: FC<PropsWithChildren<{ className?: string; }>> = ({ children, className }) => (
  <div
    className={classNames(
      "mx-auto flex w-full max-w-[360px] flex-col overflow-hidden rounded-3xl border border-primary bg-surface",
      className,
    )}
  >
    {children}
  </div>
);

/** Wallet screen header: optional back chevron, centered title, right slot. */
export const WalletHeader: FC<{ title: ReactNode; onBack?: () => void; right?: ReactNode; }> = ({
  title,
  onBack,
  right,
}) => (
  <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-1 px-3 pt-3 pb-1">
    {onBack
      ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-surfaceMuted hover:text-primary"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-4">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )
      : <span />}
    <span className="truncate text-center text-sm font-semibold text-primary">{title}</span>
    <span className="flex justify-end">{right}</span>
  </div>
);

/** Full-width accent call-to-action, the wallet's one loud button per screen. */
export const PrimaryButton: FC<PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}>> = ({ children, onClick, disabled, destructive }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={classNames(
      "w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white transition-[background-color,transform] enabled:active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40",
      destructive
        ? "bg-destructive enabled:hover:brightness-110"
        : "bg-accent enabled:hover:bg-accent6",
    )}
  >
    {children}
  </button>
);

/** Quiet secondary action that pairs with PrimaryButton. */
export const SecondaryButton: FC<PropsWithChildren<{ onClick?: () => void; disabled?: boolean; }>> = ({
  children,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full cursor-pointer rounded-xl border border-primary bg-surfaceMuted px-4 py-3 text-sm font-semibold text-primary transition-colors enabled:hover:bg-surfaceTint disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

export type Tone = "muted" | "success" | "warning" | "destructive" | "info";

const PILL_TONES: Record<Tone, string> = {
  muted: "bg-surfaceMuted text-secondary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  destructive: "bg-destructive-tint text-destructive",
  info: "bg-info-tint text-info",
};

/** Small status badge: `pending`, `failed`, `verified`, ... */
export const StatusPill: FC<PropsWithChildren<{ tone: Tone; }>> = ({ tone, children }) => (
  <span
    className={classNames(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
      PILL_TONES[tone],
    )}
  >
    {children}
  </span>
);

/** Inline spinner for pending states. */
export const Spinner: FC<{ size?: number; }> = ({ size = 14 }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
    className="animate-spin"
    style={{ width: size, height: size }}
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Row inside a wallet screen list: leading icon, title/subtitle, trailing value. */
export const ListRow: FC<{
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  subvalue?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}> = ({ icon, title, subtitle, value, subvalue, onClick, selected }) => {
  const inner = (
    <>
      {icon}
      <span className="flex min-w-0 grow flex-col items-start gap-px">
        <span className="w-full truncate text-left text-sm font-medium text-primary">{title}</span>
        {subtitle !== undefined && (
          <span className="w-full truncate text-left text-xs text-muted">{subtitle}</span>
        )}
      </span>
      {(value !== undefined || subvalue !== undefined) && (
        <span className="flex shrink-0 flex-col items-end gap-px">
          {value !== undefined && (
            <span className="text-sm font-medium text-primary tabular-nums">{value}</span>
          )}
          {subvalue !== undefined && <span className="text-xs text-muted tabular-nums">{subvalue}</span>}
        </span>
      )}
    </>
  );

  if (!onClick) {
    return <div className="flex w-full items-center gap-3 px-4 py-2.5">{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors",
        selected ? "bg-accenta2" : "hover:bg-surfaceMuted",
      )}
    >
      {inner}
    </button>
  );
};

/** Success checkmark that draws itself in - the payoff frame of a flow. */
export const SuccessCheck: FC<{ size?: number; }> = ({ size = 72 }) => (
  <span
    className="flex items-center justify-center rounded-full bg-success-tint"
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.5, height: size * 0.5 }}>
      <path
        d="M4.5 12.5l5 5 10-11"
        stroke="var(--vocs-color-green)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: "design-check-draw 0.45s ease-out 0.1s forwards",
        }}
      />
    </svg>
    <style>{"@keyframes design-check-draw { to { stroke-dashoffset: 0; } }"}</style>
  </span>
);
