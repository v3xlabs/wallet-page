"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { maxUint256 } from "viem";

import { DELEGATE_ADDRESS, formatTokenAmount, PERMIT2_ADDRESS, SELF, TOKENS } from "../data";
import { useDemoLocale } from "../locale";
import { DemoShell } from "../shell";
import type { Tone } from "../ui";
import { WalletFrame, WalletHeader } from "../ui";
import {
  Mono,
  OriginBar,
  Panel,
  RiskCheckbox,
  SheetActions,
  SheetBanner,
  SheetNote,
  SignedScreen,
  TreeRow,
  TreeSection,
  truncate,
} from "./sheet";

const USDC = TOKENS.find(token => token.symbol === "USDC") ?? TOKENS[0];

/** The app prefilled the permit with an unlimited allowance. */
const PERMIT_VALUE = maxUint256;

/** Permit deadline of uint 9999999999 — centuries away, effectively forever. */
const PERMIT_DEADLINE = "Nov 20, 2286";

/** The bytes32 an eth_sign request asks to sign — meaningless to a human. */
const OPAQUE_HASH = "0x9c1885a8e33a29ff4c15ff9dcf2f4b3f0a67d1e84be25c0c6a7f43d9d0b7215e";

/**
 * Display rule for permit amounts: decode max uint256 as what it really
 * means. Anything else renders human-readable, never as a raw uint.
 */
const permitAmount = (value: bigint, locale: string) =>
  (value === maxUint256 ? "Unlimited" : `${formatTokenAmount(value, USDC, locale)} ${USDC.symbol}`);

/** personal_sign: plain text, shown verbatim. The easy, honest case. */
const MessageSheet = () => (
  <>
    <Panel>
      <p className="border-l-2 border-secondary pl-3 text-sm leading-relaxed text-primary">
        Log in to Example on 2026-07-14. Nonce: 4821
      </p>
    </Panel>
    <SheetNote>
      This text is shown exactly as it will be signed — nothing hidden, nothing reformatted.
    </SheetNote>
  </>
);

/** eth_signTypedData_v4: an ERC-2612 permit, decoded field by field. */
const TypedDataSheet = () => {
  const locale = useDemoLocale();

  return (
    <>
      <Panel>
        <TreeSection label="Domain">
          <TreeRow label="name" value="USD Coin" />
          <TreeRow label="chainId" value={<span className="tabular-nums">1 · Ethereum</span>} />
          <TreeRow label="verifyingContract" value={<Mono>{truncate(USDC.address)}</Mono>} />
        </TreeSection>
        <TreeSection label="Message">
          <TreeRow label="owner" value={SELF.name} sub={truncate(SELF.address)} />
          <TreeRow label="spender" value="Permit2" sub={truncate(PERMIT2_ADDRESS)} />
          <TreeRow label="value" value={permitAmount(PERMIT_VALUE, locale)} danger />
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
};

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
      <WalletFrame>
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
