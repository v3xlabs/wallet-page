"use client";

import type { FC, PropsWithChildren, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { FiInfo } from "react-icons/fi";
import type { Address } from "viem";
import { maxUint256 } from "viem";

import { formatTokenAmount, SELF, TOKENS } from "../data";
import { DemoShell } from "../shell";
import type { Tone } from "../ui";
import { WalletFrame, WalletHeader } from "../ui";
import { OriginBar, RiskCheckbox, SheetActions, SheetBanner, SignedScreen } from "./sheet";

const USDC = TOKENS.find(token => token.symbol === "USDC") ?? TOKENS[0];

const truncate = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Mainnet USDC — the ERC-2612 domain of the permit below. */
const USDC_ADDRESS: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

/** Canonical Permit2 — the spender being granted the allowance. */
const PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

/** The app prefilled the permit with an unlimited allowance. */
const PERMIT_VALUE = maxUint256;

/** Permit deadline of uint 9999999999 — centuries away, effectively forever. */
const PERMIT_DEADLINE = "Nov 20, 2286";

/** Contract an EIP-7702 authorization would delegate the account to. */
const DELEGATE_ADDRESS: Address = "0x63c0C19a282a1B52b07dD5a65b58948A07DAE32B";

/** The bytes32 an eth_sign request asks to sign — meaningless to a human. */
const OPAQUE_HASH = "0x9c1885a8e33a29ff4c15ff9dcf2f4b3f0a67d1e84be25c0c6a7f43d9d0b7215e";

/**
 * Display rule for permit amounts: decode max uint256 as what it really
 * means. Anything else renders human-readable, never as a raw uint.
 */
const permitAmount = (value: bigint) =>
  (value === maxUint256 ? "Unlimited" : `${formatTokenAmount(value, USDC)} ${USDC.symbol}`);

const Mono: FC<PropsWithChildren> = ({ children }) => (
  <span className="font-mono text-xs text-primary">{children}</span>
);

/** Rounded payload panel every scenario renders its request inside. */
const Panel: FC<PropsWithChildren> = ({ children }) => (
  <div className="mx-4 flex flex-col gap-3 rounded-xl border border-primary bg-surfaceMuted/50 px-4 py-3">
    {children}
  </div>
);

const TreeSection: FC<PropsWithChildren<{ label: string; }>> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</span>
    <div className="flex flex-col border-l border-primary pl-3">{children}</div>
  </div>
);

const TreeRow: FC<{ label: string; value: ReactNode; sub?: ReactNode; danger?: boolean; }> = ({
  label,
  value,
  sub,
  danger,
}) => (
  <div className="flex items-baseline justify-between gap-3 py-1">
    <span className="text-xs text-muted">{label}</span>
    <span className="flex min-w-0 flex-col items-end gap-px text-right">
      <span className={danger ? "text-xs font-semibold text-warning" : "text-xs font-medium text-primary"}>
        {value}
      </span>
      {sub !== undefined && <span className="font-mono text-[11px] text-muted">{sub}</span>}
    </span>
  </div>
);

/** personal_sign: plain text, shown verbatim. The easy, honest case. */
const MessageSheet = () => (
  <>
    <Panel>
      <p className="border-l-2 border-secondary pl-3 text-sm leading-relaxed text-primary">
        Log in to Example on 2026-07-14. Nonce: 4821
      </p>
    </Panel>
    <p className="flex items-start gap-1.5 px-5 text-xs leading-relaxed text-muted">
      <FiInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      This text is shown exactly as it will be signed — nothing hidden, nothing reformatted.
    </p>
  </>
);

/** eth_signTypedData_v4: an ERC-2612 permit, decoded field by field. */
const TypedDataSheet = () => (
  <>
    <Panel>
      <TreeSection label="Domain">
        <TreeRow label="name" value="USD Coin" />
        <TreeRow label="chainId" value={<span className="tabular-nums">1 · Ethereum</span>} />
        <TreeRow label="verifyingContract" value={<Mono>{truncate(USDC_ADDRESS)}</Mono>} />
      </TreeSection>
      <TreeSection label="Message">
        <TreeRow label="owner" value={SELF.name} sub={truncate(SELF.address)} />
        <TreeRow label="spender" value="Permit2" sub={truncate(PERMIT2_ADDRESS)} />
        <TreeRow label="value" value={permitAmount(PERMIT_VALUE)} danger />
        <TreeRow label="nonce" value={<span className="tabular-nums">4</span>} />
        <TreeRow label="deadline" value={PERMIT_DEADLINE} danger />
      </TreeSection>
    </Panel>
    <SheetBanner tone="warning">
      This grants an UNLIMITED spend allowance over your USDC, valid until 2286. The spender can
      move your full balance at any time.
    </SheetBanner>
  </>
);

/** eth_sign: opaque bytes32. Nothing to decode, everything to distrust. */
const BlindSheet = () => (
  <>
    <Panel>
      <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Payload</span>
      <p className="font-mono text-xs leading-relaxed break-all text-primary">{OPAQUE_HASH}</p>
    </Panel>
    <SheetBanner tone="destructive">
      This request is not readable. Signing opaque data can authorize anything — a careful wallet
      refuses or heavily warns.
    </SheetBanner>
  </>
);

/** EIP-7702 authorization: delegates the account's code to a contract. */
const DelegationSheet = () => (
  <>
    <Panel>
      <TreeSection label="Authorization">
        <TreeRow label="delegate to" value={<Mono>{truncate(DELEGATE_ADDRESS)}</Mono>} sub="Unknown contract" />
        <TreeRow label="chain" value="Ethereum" />
        <TreeRow label="nonce" value={<span className="tabular-nums">7</span>} />
      </TreeSection>
    </Panel>
    <SheetBanner tone="destructive">
      This signature hands control of your account to this contract. It can then move every asset
      you own.
    </SheetBanner>
  </>
);

type Scenario = "message" | "typed" | "blind" | "delegation";
type Phase = "review" | "signing" | "signed";

const SCENARIOS: Record<Scenario, {
  label: string;
  title: string;
  method: string;
  host: string;
  verdict: string;
  verdictTone: Tone;
  /** Gated scenarios hide Sign behind an explicit risk acknowledgement. */
  gated?: boolean;
  signedLabel: string;
  body: FC;
}> = {
  message: {
    label: "Message",
    title: "Sign-in request",
    method: "personal_sign",
    host: "app.example.org",
    verdict: "Verified",
    verdictTone: "success",
    signedLabel: "Sign-in message for app.example.org",
    body: MessageSheet,
  },
  typed: {
    label: "Typed data",
    title: "Spending permit",
    method: "eth_signTypedData_v4",
    host: "app.exampleswap.org",
    verdict: "Verified",
    verdictTone: "success",
    signedLabel: "USDC spending permit for Permit2",
    body: TypedDataSheet,
  },
  blind: {
    label: "Blind hash",
    title: "Unreadable request",
    method: "eth_sign",
    host: "pool.legacy-dapp.io",
    verdict: "Unknown",
    verdictTone: "warning",
    gated: true,
    signedLabel: "An opaque hash for pool.legacy-dapp.io",
    body: BlindSheet,
  },
  delegation: {
    label: "Delegation",
    title: "Account delegation",
    method: "EIP-7702 authorization",
    host: "app.batchpay.xyz",
    verdict: "Unknown",
    verdictTone: "warning",
    gated: true,
    signedLabel: `Delegation of ${SELF.name} to ${truncate(DELEGATE_ADDRESS)}`,
    body: DelegationSheet,
  },
};

const OPTIONS = (Object.keys(SCENARIOS) as Scenario[]).map(value => ({
  value,
  label: SCENARIOS[value].label,
}));

export const SigningDemo = () => {
  const [scenario, setScenario] = useState<Scenario>("message");
  const [phase, setPhase] = useState<Phase>("review");
  const [acknowledged, setAcknowledged] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reset = () => {
    clearTimeout(timer.current);
    setPhase("review");
    setAcknowledged(false);
  };

  const switchScenario = (next: Scenario) => {
    reset();
    setScenario(next);
  };

  const sign = () => {
    setPhase("signing");
    timer.current = setTimeout(() => setPhase("signed"), 700);
  };

  const current = SCENARIOS[scenario];
  const Body = current.body;

  return (
    <DemoShell
      source="components/design/signing/signing.tsx"
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
        <WalletHeader title={current.title} />
        {phase === "signed"
          ? <SignedScreen label={current.signedLabel} onDone={reset} />
          : (
              <>
                <OriginBar host={current.host} verdict={current.verdict} tone={current.verdictTone} />
                <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1.5">
                  <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                    Request
                  </span>
                  <span className="font-mono text-[11px] text-muted">{current.method}</span>
                </div>
                <div className="flex grow flex-col gap-3">
                  <Body />
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    {current.gated && (
                      <RiskCheckbox checked={acknowledged} onChange={setAcknowledged} />
                    )}
                    <SheetActions
                      onReject={reset}
                      onSign={sign}
                      signing={phase === "signing"}
                      disabled={current.gated && !acknowledged}
                      destructive={current.gated}
                    />
                  </div>
                </div>
              </>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
