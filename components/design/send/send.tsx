"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { DemoToken } from "../data";
import { fiatValue, formatTokenAmount } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { useDemoLocale, useLocaleControl } from "../locale";
import { DemoShell } from "../shell";
import { TokenPicker } from "../token-picker";
import {
  PrimaryButton,
  Spinner,
  SuccessCheck,
  TokenIcon,
  WalletFrame,
  WalletHeader,
} from "../ui";
import { AmountScreen } from "./amount";
import { RecipientScreen } from "./recipient";
import type { DisplayCurrency, Recipient } from "./shared";
import {
  CURRENCIES,
  currencyFor,
  ETH,
  FEE_WEI,
  formatDisplayCurrency,
  parseAmount,
  truncate,
} from "./shared";

type Step = "recipient" | "amount" | "asset" | "review" | "success";

const ReviewRow = ({ label, value, subvalue }: {
  label: string;
  value: ReactNode;
  subvalue?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 px-4 py-3">
    <span className="text-[13px] text-secondary">{label}</span>
    <span className="flex flex-col items-end gap-px text-right">
      <span className="text-[13px] font-medium text-primary">{value}</span>
      {subvalue !== undefined && <span className="text-xs text-muted tabular-nums">{subvalue}</span>}
    </span>
  </div>
);

const ReviewScreen = ({ token, recipient, amount, currency, onConfirm }: {
  token: DemoToken;
  recipient: Recipient;
  amount: bigint;
  currency: DisplayCurrency;
  onConfirm: () => void;
}) => {
  const locale = useDemoLocale();
  const [sending, setSending] = useState(false);

  const confirm = () => {
    setSending(true);
    setTimeout(onConfirm, 900);
  };

  const feeUsd = fiatValue(ETH, FEE_WEI);
  const totalUsd = fiatValue(token, amount) + feeUsd;
  // Tokens resolved from a pasted contract carry no price feed.
  const priceless = token.priceUsd === 0;

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4">
        <TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={44} />
        <span className="text-3xl font-semibold text-primary tabular-nums">
          {formatTokenAmount(amount, token, locale)}
          {" "}
          {token.symbol}
        </span>
        {!priceless && (
          <span className="text-sm text-muted tabular-nums">
            {formatDisplayCurrency(fiatValue(token, amount), currency, locale)}
          </span>
        )}
      </div>
      <div className="mx-4 mb-4 divide-y divide-(--vocs-border-color-primary) rounded-xl border border-primary bg-surfaceMuted/50">
        <ReviewRow
          label="To"
          value={(
            <span className="flex items-center gap-1.5">
              <EnsAvatar address={recipient.address} name={recipient.name} size={16} />
              {recipient.name ?? truncate(recipient.address)}
            </span>
          )}
          subvalue={recipient.name ? truncate(recipient.address) : undefined}
        />
        <ReviewRow label="Network" value="Ethereum" />
        <ReviewRow
          label="Network fee"
          value={`${formatTokenAmount(FEE_WEI, ETH, locale)} ETH`}
          subvalue={formatDisplayCurrency(feeUsd, currency, locale)}
        />
        {!priceless && (
          <ReviewRow label="Total" value={formatDisplayCurrency(totalUsd, currency, locale)} />
        )}
      </div>
      <div className="px-4 pb-4">
        <PrimaryButton onClick={confirm} disabled={sending}>
          {sending
            ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Sending…
                </span>
              )
            : "Confirm send"}
        </PrimaryButton>
      </div>
    </>
  );
};

const TITLES: Record<Step, string> = {
  recipient: "Send to",
  amount: "Send",
  asset: "Select asset",
  review: "Review",
  success: "Sent",
};

const BACK: Partial<Record<Step, Step>> = {
  amount: "recipient",
  asset: "amount",
  review: "amount",
};

const CURRENCY_VARIANTS = CURRENCIES.map(entry => ({ value: entry.value, label: entry.value }));

export const SendDemo = () => {
  const [locale, localeControl] = useLocaleControl();
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<Recipient>();
  const [token, setToken] = useState<DemoToken>(ETH);
  const [amountText, setAmountText] = useState("");
  const [unit, setUnit] = useState<"token" | "fiat">("token");
  const [currency, setCurrency] = useState<DisplayCurrency>("USD");

  const amount = parseAmount(amountText, token, unit, locale, currencyFor(currency).rate) ?? 0n;

  const reset = () => {
    setStep("recipient");
    setRecipient(undefined);
    setToken(ETH);
    setAmountText("");
    setUnit("token");
  };

  const back = BACK[step];

  return (
    <DemoShell
      source="components/design/send/send.tsx"
      locale={locale}
      controls={{
        currency: {
          type: "select",
          label: "Display currency",
          options: CURRENCY_VARIANTS,
          value: currency,
          onChange: value => setCurrency(value as DisplayCurrency),
        },
        locale: localeControl,
      }}
    >
      <WalletFrame>
        <WalletHeader
          title={TITLES[step]}
          onBack={back ? () => setStep(back) : undefined}
        />
        {step === "recipient" && (
          <RecipientScreen
            onPick={(picked) => {
              setRecipient(picked);
              setStep("amount");
            }}
          />
        )}
        {step === "amount" && recipient && (
          <AmountScreen
            token={token}
            recipient={recipient}
            amountText={amountText}
            unit={unit}
            currency={currency}
            onAmount={setAmountText}
            onUnit={setUnit}
            onPickAsset={() => setStep("asset")}
            onContinue={() => setStep("review")}
          />
        )}
        {step === "asset" && (
          <div className="pb-3">
            <TokenPicker
              selected={token.symbol}
              onPick={(picked) => {
                if (picked.symbol !== token.symbol) {
                  setToken(picked);
                  setAmountText("");
                  setUnit("token");
                }

                setStep("amount");
              }}
            />
          </div>
        )}
        {step === "review" && recipient && (
          <ReviewScreen
            token={token}
            recipient={recipient}
            amount={amount}
            currency={currency}
            onConfirm={() => setStep("success")}
          />
        )}
        {step === "success" && recipient && (
          <div className="flex grow flex-col items-center justify-center gap-3 px-4 pt-6 pb-4">
            <SuccessCheck />
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-primary tabular-nums">
                Sent
                {" "}
                {formatTokenAmount(amount, token, locale)}
                {" "}
                {token.symbol}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted">
                to
                <EnsAvatar address={recipient.address} name={recipient.name} size={16} />
                <span className="font-medium text-secondary">
                  {recipient.name ?? truncate(recipient.address)}
                </span>
              </span>
            </div>
            <a
              className="text-xs text-accent hover:underline"
              href={`https://etherscan.io/address/${recipient.address}`}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer ↗
            </a>
            <div className="w-full pt-3">
              <PrimaryButton onClick={reset}>Done</PrimaryButton>
            </div>
          </div>
        )}
      </WalletFrame>
    </DemoShell>
  );
};
