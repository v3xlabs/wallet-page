"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";

import {
  CONTACTS,
  formatTokenAmount,
  PERMIT2_ADDRESS,
  TOKENS,
  UNKNOWN_CONTRACT_ADDRESS,
  usdValue,
} from "../data";
import { useDemoLocale, useDisplayValue } from "../locale";
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

const ETH = TOKENS.find(token => token.symbol === "ETH") ?? TOKENS[0];
const USDC = TOKENS.find(token => token.symbol === "USDC") ?? TOKENS[0];
const RECIPIENT = CONTACTS.find(contact => contact.name === "vitalik.eth") ?? CONTACTS[0];

/** 0.1 ETH the app asks to send. */
const SEND_VALUE = parseUnits("0.1", 18);

/** 250 USDC transfer, decoded out of the calldata. */
const TRANSFER_VALUE = parseUnits("250", 6);

/** Calldata the wallet has no ABI for - the transaction analog of a blind hash. */
const OPAQUE_CALLDATA
  = "0xef5b3d40000000000000000000000000225f137127d9067788314bc7fcc1f36746a3c3b500000000000000000000000000000000000000000000000000000000000f4240";

/** Plausible mainnet fee estimates per scenario, in wei. */
const FEES = {
  send: parseUnits("0.00013", 18),
  transfer: parseUnits("0.00012", 18),
  approve: parseUnits("0.00011", 18),
  unknown: parseUnits("0.00043", 18),
};

/** Every transaction shows its cost before asking for a decision. */
const CostSection: FC<{ fee: bigint; total?: bigint; }> = ({ fee, total }) => {
  const locale = useDemoLocale();
  const display = useDisplayValue();
  const rows = [
    { label: "network fee", amount: fee },
    ...(total === undefined ? [] : [{ label: "total", amount: total }]),
  ];

  return (
    <TreeSection label="Cost">
      {rows.map(row => (
        <TreeRow
          key={row.label}
          label={row.label}
          value={display(usdValue(ETH, row.amount))}
          sub={`${formatTokenAmount(row.amount, ETH, locale)} ETH`}
        />
      ))}
    </TreeSection>
  );
};

/** Native transfer: value moves, no calldata to decode. The baseline. */
const SendEthSheet = () => {
  const locale = useDemoLocale();
  const display = useDisplayValue();

  return (
    <>
      <Panel>
        <TreeSection label="Transfer">
          <TreeRow label="recipient" value={RECIPIENT.name} sub={truncate(RECIPIENT.address)} />
          <TreeRow
            label="amount"
            value={`${formatTokenAmount(SEND_VALUE, ETH, locale)} ETH`}
            sub={display(usdValue(ETH, SEND_VALUE))}
          />
        </TreeSection>
        <CostSection fee={FEES.send} total={SEND_VALUE + FEES.send} />
      </Panel>
      <SheetNote>
        Amount and fee are shown together - the total is what actually leaves the account.
      </SheetNote>
    </>
  );
};

/** ERC-20 transfer: the tx's `to` is the token contract, not the recipient. */
const TokenTransferSheet = () => {
  const locale = useDemoLocale();
  const display = useDisplayValue();

  return (
    <>
      <Panel>
        <TreeSection label="Contract">
          <TreeRow label="token" value={USDC.name} sub={truncate(USDC.address)} />
          <TreeRow label="method" value={<Mono>transfer(to, amount)</Mono>} />
        </TreeSection>
        <TreeSection label="Decoded">
          <TreeRow label="recipient" value={RECIPIENT.name} sub={truncate(RECIPIENT.address)} />
          <TreeRow
            label="amount"
            value={`${formatTokenAmount(TRANSFER_VALUE, USDC, locale)} ${USDC.symbol}`}
            sub={display(usdValue(USDC, TRANSFER_VALUE))}
          />
        </TreeSection>
        <CostSection fee={FEES.transfer} />
      </Panel>
      <SheetNote>
        The transaction is addressed to the USDC contract. The wallet decodes the calldata and
        surfaces who actually receives the funds.
      </SheetNote>
    </>
  );
};

/** ERC-20 approve: the permit's twin, paid for with gas instead of a signature. */
const ApproveSheet = () => (
  <>
    <Panel>
      <TreeSection label="Contract">
        <TreeRow label="token" value={USDC.name} sub={truncate(USDC.address)} />
        <TreeRow label="method" value={<Mono>approve(spender, amount)</Mono>} />
      </TreeSection>
      <TreeSection label="Decoded">
        <TreeRow label="spender" value="Permit2" sub={truncate(PERMIT2_ADDRESS)} />
        <TreeRow label="allowance" value="Unlimited" danger />
      </TreeSection>
      <CostSection fee={FEES.approve} />
    </Panel>
    <SheetBanner tone="warning">
      This grants an UNLIMITED spend allowance over your USDC - the same authority as the signed
      permit, granted on-chain. The spender can move your full balance at any time.
    </SheetBanner>
  </>
);

/** Unknown calldata: nothing to decode, everything to distrust. */
const UnknownCallSheet = () => (
  <>
    <Panel>
      <TreeSection label="Contract">
        <TreeRow
          label="to"
          value={<Mono>{truncate(UNKNOWN_CONTRACT_ADDRESS)}</Mono>}
          sub="Unverified contract"
        />
        <TreeRow label="value" value="0 ETH" />
      </TreeSection>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Calldata</span>
        <p className="font-mono text-xs leading-relaxed break-all text-primary">{OPAQUE_CALLDATA}</p>
      </div>
      <CostSection fee={FEES.unknown} />
    </Panel>
    <SheetBanner tone="destructive">
      The wallet cannot decode this call. It can do anything the contract allows - including moving
      assets the account has approved.
    </SheetBanner>
  </>
);

type Scenario = "send" | "transfer" | "approve" | "unknown";
type Phase = "review" | "confirming" | "submitted";

const SCENARIOS: Record<Scenario, {
  label: string;
  title: string;
  host: string;
  verdict: string;
  verdictTone: Tone;
  /** Gated scenarios hide Confirm behind an explicit risk acknowledgement. */
  gated?: boolean;
  submittedLabel: string;
  body: FC;
}> = {
  send: {
    label: "Send ETH",
    title: "Send ETH",
    host: "app.example.org",
    verdict: "Verified",
    verdictTone: "success",
    submittedLabel: `0.1 ETH to ${RECIPIENT.name}`,
    body: SendEthSheet,
  },
  transfer: {
    label: "Token transfer",
    title: "Send USDC",
    host: "app.example.org",
    verdict: "Verified",
    verdictTone: "success",
    submittedLabel: `250 USDC to ${RECIPIENT.name}`,
    body: TokenTransferSheet,
  },
  approve: {
    label: "Approval",
    title: "Token approval",
    host: "app.exampleswap.org",
    verdict: "Verified",
    verdictTone: "success",
    submittedLabel: "USDC allowance for Permit2",
    body: ApproveSheet,
  },
  unknown: {
    label: "Unknown call",
    title: "Contract call",
    host: "pool.legacy-dapp.io",
    verdict: "Unknown",
    verdictTone: "warning",
    gated: true,
    submittedLabel: `A raw call to ${truncate(UNKNOWN_CONTRACT_ADDRESS)}`,
    body: UnknownCallSheet,
  },
};

const OPTIONS = (Object.keys(SCENARIOS) as Scenario[]).map(value => ({
  value,
  label: SCENARIOS[value].label,
}));

export const TransactionDemo = () => {
  const [scenario, setScenario] = useState<Scenario>("send");
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

  const confirm = () => {
    setPhase("confirming");
    timer.current = setTimeout(() => setPhase("submitted"), 700);
  };

  const current = SCENARIOS[scenario];
  const Body = current.body;

  return (
    <DemoShell
      source="components/design/signing/transactions.tsx"
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
        <WalletHeader title={current.title} />
        {phase === "submitted"
          ? <SignedScreen title="Submitted" label={current.submittedLabel} onDone={reset} />
          : (
              <>
                <OriginBar host={current.host} verdict={current.verdict} tone={current.verdictTone} />
                <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1.5">
                  <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                    Request
                  </span>
                  <span className="font-mono text-[11px] text-muted">eth_sendTransaction</span>
                </div>
                <div className="flex grow flex-col gap-3">
                  <Body />
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    {current.gated && (
                      <RiskCheckbox checked={acknowledged} onChange={setAcknowledged} />
                    )}
                    <SheetActions
                      onReject={reset}
                      onSign={confirm}
                      signing={phase === "confirming"}
                      signLabel="Confirm"
                      signingLabel="Confirming…"
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
