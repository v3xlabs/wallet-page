"use client";

import classNames from "classnames";
import type { FC, ReactNode } from "react";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheck,
  FiCopy,
  FiFileText,
  FiRepeat,
  FiShield,
} from "react-icons/fi";

import { EnsAvatar } from "../ens-avatar";
import { Spinner, StatusPill, TokenIcon } from "../ui";
import type { EntryKind, HistoryEntry } from "./entries";
import { truncateHash } from "./entries";

const BADGES: Record<EntryKind, IconType> = {
  send: FiArrowUpRight,
  receive: FiArrowDownLeft,
  swap: FiRepeat,
  approve: FiShield,
  interact: FiFileText,
};

/** Tiny direction glyph overlapping the leading circle's corner. */
const DirectionBadge: FC<{ kind: EntryKind; }> = ({ kind }) => {
  const Icon = BADGES[kind];

  return (
    <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-surface ring-1 ring-(--vocs-border-color-primary)">
      <Icon className="size-2.5 text-secondary" strokeWidth={2.5} />
    </span>
  );
};

const EntryCircle: FC<{ entry: HistoryEntry; }> = ({ entry }) => (
  <span className="relative shrink-0">
    {entry.icon.type === "token"
      ? <TokenIcon symbol={entry.icon.token.symbol} color={entry.icon.token.color} address={entry.icon.token.address} size={36} />
      : <EnsAvatar address={entry.icon.address} size={36} />}
    <DirectionBadge kind={entry.kind} />
  </span>
);

const CopyHash: FC<{ hash: string; }> = ({ hash }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy transaction hash"
      className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-accent"
    >
      <span className="font-mono">{truncateHash(hash)}</span>
      {copied
        ? (
            <span className="flex items-center gap-0.5 text-success">
              <FiCheck className="size-3" />
              Copied
            </span>
          )
        : <FiCopy className="size-3 text-muted" />}
    </button>
  );
};

const DetailRow: FC<{ label: string; children: ReactNode; }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-muted">{label}</span>
    <span className="text-right text-xs font-medium text-primary tabular-nums">{children}</span>
  </div>
);

/** Right column: signed amount over fiat — or a loud pill when it failed. */
const TrailingValue: FC<{ entry: HistoryEntry; }> = ({ entry }) => {
  if (entry.status === "failed") {
    return (
      <span className="flex shrink-0 flex-col items-end gap-1">
        <StatusPill tone="destructive">Failed</StatusPill>
        {entry.amount !== undefined && (
          <span className="text-xs text-muted line-through tabular-nums">{entry.amount}</span>
        )}
      </span>
    );
  }

  if (entry.amount === undefined) return null;

  return (
    <span className="flex shrink-0 flex-col items-end gap-px">
      <span
        className={classNames(
          "text-sm font-medium tabular-nums",
          entry.incoming ? "text-success" : "text-primary",
        )}
      >
        {entry.amount}
      </span>
      {entry.fiat !== undefined && <span className="text-xs text-muted tabular-nums">{entry.fiat}</span>}
    </span>
  );
};

export const EntryRow: FC<{
  entry: HistoryEntry;
  expanded: boolean;
  onToggle: () => void;
  /** Speed-up lifecycle for the one pending entry. */
  speeding?: boolean;
  onSpeedUp?: () => void;
}> = ({ entry, expanded, onToggle, speeding, onSpeedUp }) => {
  const expandable = entry.status !== "pending" && entry.detail !== undefined;

  const body = (
    <>
      <EntryCircle entry={entry} />
      <span className="flex min-w-0 grow flex-col items-start gap-px">
        <span className="w-full truncate text-left text-sm font-medium text-primary">{entry.title}</span>
        <span className="w-full truncate text-left text-xs text-muted">{entry.subtitle}</span>
      </span>
      <TrailingValue entry={entry} />
    </>
  );

  return (
    <div>
      {expandable
        ? (
            <button
              type="button"
              onClick={onToggle}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surfaceMuted"
            >
              {body}
            </button>
          )
        : <div className="flex w-full items-center gap-3 px-4 py-2.5">{body}</div>}
      {entry.status === "pending" && (
        <div className="-mt-1.5 flex items-center gap-2 pr-4 pb-2.5 pl-16">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Spinner size={12} />
            {speeding ? "Speeding up…" : "Pending · 12 sec"}
          </span>
          {!speeding && (
            <button
              type="button"
              onClick={onSpeedUp}
              className="cursor-pointer text-xs font-medium text-accent hover:underline"
            >
              Speed up
            </button>
          )}
        </div>
      )}
      {entry.status === "failed" && entry.caption !== undefined && (
        <div className="-mt-1.5 flex items-center gap-2 pr-4 pb-2.5 pl-16">
          <span className="text-xs text-muted">{entry.caption}</span>
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-accent hover:underline"
            title="Rebuild this swap with fresh quotes"
          >
            Retry
          </button>
        </div>
      )}
      {entry.status === "confirmed" && entry.caption !== undefined && (
        <div className="-mt-1.5 pr-4 pb-2.5 pl-16 text-xs text-muted">{entry.caption}</div>
      )}
      {expandable && entry.detail && (
        <div
          className={classNames(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="mx-4 mb-2.5 flex flex-col gap-2 rounded-xl bg-surfaceMuted/60 px-3 py-2.5">
              <DetailRow label="Transaction">
                <CopyHash hash={entry.detail.hash} />
              </DetailRow>
              <DetailRow label="Network fee">{entry.detail.fee}</DetailRow>
              <DetailRow label="Block time">{entry.detail.blockTime}</DetailRow>
              <p className="border-t border-primary pt-2 text-[11px] text-muted">
                {entry.detail.association}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
