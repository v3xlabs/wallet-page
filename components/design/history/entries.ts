import type { Address } from "viem";

import type { DemoToken } from "../data";
import { CONTACTS, formatUsd, SELF, TOKENS } from "../data";

/**
 * Fixed, deterministic activity feed for the history demo. Every entry kind a
 * wallet actually produces is represented: sends, receives, swaps, approvals,
 * and plain contract interactions — pending, confirmed, and failed alike.
 */

export type EntryKind = "send" | "receive" | "swap" | "approve" | "interact";
export type EntryStatus = "pending" | "confirmed" | "failed";

export const GROUPS = ["Today", "Yesterday", "May 2"] as const;
export type EntryGroup = (typeof GROUPS)[number];

/** Leading circle: token mark, or the counterparty when that says more. */
export type EntryIcon =
  | { type: "token"; token: DemoToken; }
  | { type: "address"; address: Address; };

export type EntryDetail = {
  hash: string;
  fee: string;
  blockTime: string;
  /** Provenance: who actually got this transaction on chain. */
  association: string;
};

export type HistoryEntry = {
  id: string;
  group: EntryGroup;
  kind: EntryKind;
  status: EntryStatus;
  title: string;
  subtitle: string;
  icon: EntryIcon;
  amount?: string;
  /** Incoming value renders in the success tone; everything else stays quiet. */
  incoming?: boolean;
  fiat?: string;
  /** Extra muted line under the row: spend limits, failure reasons, … */
  caption?: string;
  detail?: EntryDetail;
};

// TOKENS is ordered ETH, WETH, USDC, DAI, … — skip WETH.
const [ETH, , USDC, DAI] = TOKENS;
const [VITALIK, LUC, KASSANDRA] = CONTACTS;

export const truncateHash = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-6)}`;

export const ENTRIES: HistoryEntry[] = [
  {
    id: "send-eth-pending",
    group: "Today",
    kind: "send",
    status: "pending",
    title: "Sending ETH",
    subtitle: "To vitalik.eth",
    icon: { type: "address", address: VITALIK.address },
    amount: "−0.25 ETH",
    fiat: formatUsd(0.25 * ETH.priceUsd),
    // Shown once the speed-up replacement lands.
    detail: {
      hash: "0x7d4e2f8a91c3b6d05e4f7a2c8b1d9e3f6a0c5b8d2e7f4a1c9b3d6e0f5a8c2b47",
      fee: "0.00058 ETH · $2.26",
      blockTime: "Today · 9:42 AM",
      association: "Submitted by this wallet — replaced a slower transaction",
    },
  },
  {
    id: "receive-usdc",
    group: "Today",
    kind: "receive",
    status: "confirmed",
    title: "Received USDC",
    subtitle: `From ${LUC.name}`,
    icon: { type: "address", address: LUC.address },
    amount: "+500 USDC",
    incoming: true,
    fiat: formatUsd(500 * USDC.priceUsd),
    detail: {
      hash: "0x9b2f6c1e84a7d3f05c8e2b9d4a6f1c7e3b0d8f5a2c9e6b4d1f7a3c0e5b8d2f61",
      fee: "Paid by sender",
      blockTime: "Today · 8:15 AM",
      association: `Submitted by ${LUC.name}`,
    },
  },
  {
    id: "swap-eth-usdc-failed",
    group: "Yesterday",
    kind: "swap",
    status: "failed",
    title: "Swap ETH → USDC",
    subtitle: "Swap router",
    icon: { type: "token", token: ETH },
    amount: "−0.4 ETH",
    caption: "Slippage exceeded",
    detail: {
      hash: "0x3a8c5d2f97b1e6c40d3f8a5b2e9c6d1f4a7b0e3c8d5f2a9b6e1c4d7f0a3b8e52",
      fee: "0.00184 ETH · $7.16",
      blockTime: "Yesterday · 3:47 PM",
      association: "Submitted by this wallet",
    },
  },
  {
    id: "send-dai",
    group: "Yesterday",
    kind: "send",
    status: "confirmed",
    title: "Sent DAI",
    subtitle: `To ${KASSANDRA.name}`,
    icon: { type: "address", address: KASSANDRA.address },
    amount: "−120 DAI",
    fiat: formatUsd(120 * DAI.priceUsd),
    detail: {
      hash: "0x5e1b9f4c72a8d6e30f5c2a9b7d4e1f8c6a3b0d7e4f1c8a5b2d9e6f3a0c7b4d18",
      fee: "0.00048 ETH · $1.87",
      blockTime: "Yesterday · 11:26 AM",
      association: "Submitted by this wallet",
    },
  },
  {
    id: "approve-usdc",
    group: "May 2",
    kind: "approve",
    status: "confirmed",
    title: "Approved USDC",
    subtitle: "Permit2",
    icon: { type: "token", token: USDC },
    caption: "Spend limit: 500 USDC",
    detail: {
      hash: "0x2c7f4a1d85e9b3c60a2d7f4e1b8c5a9d3e6f0b7c4a1d8e5f2b9c6a3d0e7f4b25",
      fee: "0.00092 ETH · $3.58",
      blockTime: "May 2 · 2:31 PM",
      association: "Part of a batch — 2 actions",
    },
  },
  {
    id: "renew-ens",
    group: "May 2",
    kind: "interact",
    status: "confirmed",
    title: "Renewed petra.eth",
    subtitle: "ENS Registrar · 1 yr extension",
    icon: { type: "address", address: SELF.address },
    amount: "−0.0042 ETH",
    fiat: formatUsd(0.0042 * ETH.priceUsd),
    detail: {
      hash: "0x6d3a8e5f21c7b4d90e6a3f8c5b2d9e4f1a7c0b6d3e8f5a2c9b4d1e7f0a5c8b34",
      fee: "Sponsored — paid by relayer",
      blockTime: "May 2 · 9:04 AM",
      association: "Relayed via Gelato",
    },
  },
];

/** The pending send after its speed-up replacement is mined. */
export const confirmPending = (entry: HistoryEntry): HistoryEntry => ({
  ...entry,
  status: "confirmed",
  title: "Sent ETH",
});
