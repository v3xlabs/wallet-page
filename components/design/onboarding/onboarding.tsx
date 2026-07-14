"use client";

import classNames from "classnames";
import { useState } from "react";

import { SELF } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { DemoShell } from "../shell";
import {
  PrimaryButton,
  SecondaryButton,
  SuccessCheck,
  WalletFrame,
  WalletHeader,
} from "../ui";
import { BackupScreen } from "./backup";
import { ACCOUNT_ADDRESS, truncate } from "./shared";
import { VerifyScreen } from "./verify";

type Step = "welcome" | "existing" | "backup" | "verify" | "done";

const TITLES: Record<Step, string> = {
  welcome: "Welcome",
  existing: "Welcome",
  backup: "Your recovery phrase",
  verify: "Quick check",
  done: "Wallet ready",
};

const BACK: Partial<Record<Step, Step>> = {
  existing: "welcome",
  backup: "welcome",
  verify: "backup",
};

/** Which of the four progress dots the current step lights up. */
const DOT_INDEX: Record<Step, number> = {
  welcome: 0,
  existing: 0,
  backup: 1,
  verify: 2,
  done: 3,
};

const StepDots = ({ current }: { current: number; }) => (
  <span className="flex items-center gap-1" aria-label={`Step ${current + 1} of 4`}>
    {[0, 1, 2, 3].map(dot => (
      <span
        key={dot}
        className={classNames(
          "size-1.5 rounded-full transition-colors",
          dot <= current ? "bg-accent" : "bg-accenta3",
        )}
      />
    ))}
  </span>
);

const WelcomeScreen = ({ onCreate, onExisting }: {
  onCreate: () => void;
  onExisting: () => void;
}) => (
  <div className="flex grow flex-col px-5 pb-5">
    <div className="flex grow flex-col items-center justify-center gap-4 py-8 text-center">
      <EnsAvatar address={SELF.address} name={SELF.name} size={64} />
      <div className="flex flex-col gap-1.5">
        <span className="text-lg font-semibold text-primary">Your keys, your wallet</span>
        <p className="text-[13px] leading-relaxed text-secondary">
          Twelve words are about to become the only thing that controls this account. Give them
          two quiet minutes.
        </p>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <PrimaryButton onClick={onCreate}>Create a new wallet</PrimaryButton>
      <SecondaryButton onClick={onExisting}>I already have one</SecondaryButton>
    </div>
  </div>
);

const ExistingScreen = ({ onBack }: { onBack: () => void; }) => (
  <div className="flex grow flex-col px-5 pb-5">
    <div className="flex grow flex-col items-center justify-center py-8">
      <p className="text-center text-[13px] leading-relaxed text-muted">
        Existing wallets come in through a dedicated import flow — recovery phrase, private key,
        or watch-only address — not through onboarding.
      </p>
    </div>
    <SecondaryButton onClick={onBack}>Back</SecondaryButton>
  </div>
);

const DoneScreen = ({ onOpen }: { onOpen: () => void; }) => (
  <div className="flex grow flex-col items-center justify-center gap-4 px-4 pt-6 pb-4">
    <SuccessCheck />
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg font-semibold text-primary">Backed up and verified</span>
      <span className="text-[13px] text-muted">Your first account is ready to use.</span>
    </div>
    <div className="flex w-full items-center gap-3 rounded-xl border border-primary bg-surfaceMuted/50 px-3 py-2.5">
      <EnsAvatar address={ACCOUNT_ADDRESS} size={36} />
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-primary">Account 1</span>
        <span className="font-mono text-xs text-muted" title={ACCOUNT_ADDRESS}>
          {truncate(ACCOUNT_ADDRESS)}
        </span>
      </span>
    </div>
    <div className="flex w-full flex-col gap-2 pt-2">
      <PrimaryButton onClick={onOpen}>Open wallet</PrimaryButton>
      <p className="text-center text-[11px] text-muted">
        Derived from the demo phrase — never reuse it.
      </p>
    </div>
  </div>
);

export const OnboardingDemo = () => {
  const [step, setStep] = useState<Step>("welcome");

  const back = BACK[step];

  return (
    <DemoShell source="components/design/onboarding/onboarding.tsx">
      <WalletFrame className="min-h-[440px]">
        <WalletHeader
          title={TITLES[step]}
          onBack={back ? () => setStep(back) : undefined}
          right={<StepDots current={DOT_INDEX[step]} />}
        />
        {step === "welcome" && (
          <WelcomeScreen
            onCreate={() => setStep("backup")}
            onExisting={() => setStep("existing")}
          />
        )}
        {step === "existing" && <ExistingScreen onBack={() => setStep("welcome")} />}
        {step === "backup" && <BackupScreen onContinue={() => setStep("verify")} />}
        {step === "verify" && <VerifyScreen onDone={() => setStep("done")} />}
        {step === "done" && <DoneScreen onOpen={() => setStep("welcome")} />}
      </WalletFrame>
    </DemoShell>
  );
};
