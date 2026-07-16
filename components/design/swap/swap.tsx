"use client";

import { useEffect, useState } from "react";

import { useDemoLocale, useDisplayValue } from "../locale";
import { DemoShell } from "../shell";
import type { PickedToken } from "../token-picker";
import { TokenPicker } from "../token-picker";
import { PrimaryButton, SuccessCheck, WalletFrame, WalletHeader } from "../ui";
import { SwapDetails } from "./details";
import { FlipButton, PayPanel, ReceivePanel } from "./panels";
import { ReviewScreen } from "./review";
import type { Slippage } from "./shared";
import {
  balanceOf,
  computeQuote,
  ETH,
  formatAmount,
  IMPACT_HIGH_PCT,
  maxPayText,
  parsePayAmount,
  USDC,
} from "./shared";

type Step = "swap" | "select" | "review" | "success";

const TITLES: Record<Step, string> = {
  swap: "Swap",
  select: "Select token",
  review: "Review swap",
  success: "Swapped",
};

const BACK: Partial<Record<Step, Step>> = {
  select: "swap",
  review: "swap",
};

export const SwapDemo = () => {
  const locale = useDemoLocale();
  const display = useDisplayValue();
  const [step, setStep] = useState<Step>("swap");
  const [selectSide, setSelectSide] = useState<"pay" | "receive">("pay");
  const [pay, setPay] = useState<PickedToken>(ETH);
  const [receive, setReceive] = useState<PickedToken>(USDC);
  const [amountText, setAmountText] = useState("");
  const [slippage, setSlippage] = useState<Slippage>(0.5);
  const [quoting, setQuoting] = useState(false);
  const [flips, setFlips] = useState(0);
  const [ackImpact, setAckImpact] = useState(false);

  const payAmount = parsePayAmount(amountText, locale);
  const hasAmount = payAmount !== undefined && payAmount > 0;
  // Tokens resolved from a pasted contract carry no price feed, so the
  // quote engine cannot price a pair that includes one.
  const priceless = pay.priceUsd === 0 || receive.priceUsd === 0;
  const quote = hasAmount && !quoting && !priceless
    ? computeQuote(pay, receive, payAmount)
    : undefined;
  const insufficient = payAmount !== undefined && payAmount > balanceOf(pay);
  const highImpact = quote !== undefined && quote.impactPct > IMPACT_HIGH_PCT;

  // Edits mark the quote stale; it "arrives" a debounced beat later.
  useEffect(() => {
    if (!quoting) return;

    const timer = setTimeout(() => setQuoting(false), 500);

    return () => clearTimeout(timer);
  }, [quoting, amountText, pay, receive]);

  const requote = (pending: boolean) => {
    setQuoting(pending);
    setAckImpact(false);
  };

  const setAmount = (text: string) => {
    setAmountText(text);

    const parsed = parsePayAmount(text, locale);

    requote(parsed !== undefined && parsed > 0);
  };

  const flip = () => {
    setFlips(count => count + 1);
    setPay(receive);
    setReceive(pay);
    requote(hasAmount);
  };

  const openSelect = (side: "pay" | "receive") => {
    setSelectSide(side);
    setStep("select");
  };

  const pickToken = (candidate: PickedToken) => {
    if (selectSide === "pay") {
      if (candidate.symbol === receive.symbol) setReceive(pay);

      setPay(candidate);
    }
    else {
      if (candidate.symbol === pay.symbol) setPay(receive);

      setReceive(candidate);
    }

    requote(hasAmount);
    setStep("swap");
  };

  const reset = () => {
    setStep("swap");
    setPay(ETH);
    setReceive(USDC);
    setAmountText("");
    setSlippage(0.5);
    setQuoting(false);
    setAckImpact(false);
  };

  const back = BACK[step];

  return (
    <DemoShell source="components/design/swap/swap.tsx" i18n>
      <WalletFrame>
        <WalletHeader
          title={TITLES[step]}
          onBack={back ? () => setStep(back) : undefined}
        />
        {step === "swap" && (
          <div className="flex grow flex-col gap-3 px-4 pt-1 pb-4">
            <div className="flex flex-col gap-1">
              <PayPanel
                token={pay}
                amountText={amountText}
                payUsd={hasAmount ? payAmount * pay.priceUsd : undefined}
                priceless={pay.priceUsd === 0}
                insufficient={insufficient}
                onAmount={setAmount}
                onMax={() => setAmount(maxPayText(pay, locale))}
                onPickToken={() => openSelect("pay")}
              />
              <FlipButton flips={flips} onFlip={flip} />
              <ReceivePanel
                token={receive}
                quote={quote}
                quoting={quoting}
                unavailable={priceless && hasAmount}
                onPickToken={() => openSelect("receive")}
              />
            </div>
            {quote && (
              <SwapDetails
                pay={pay}
                receive={receive}
                quote={quote}
                slippage={slippage}
                onSlippage={setSlippage}
              />
            )}
            <div className="mt-auto flex flex-col gap-3">
              {quote && highImpact && (
                <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-destructive-tint px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={ackImpact}
                    onChange={e => setAckImpact(e.target.checked)}
                    className="mt-0.5 cursor-pointer accent-(--vocs-color-red)"
                  />
                  <span className="text-xs text-destructive">
                    <span className="font-semibold">High price impact</span>
                    {" "}
                    - this trade is large for the route's depth; you lose
                    {" "}
                    <span className="font-semibold tabular-nums">{display(quote.impactUsd)}</span>
                    {" "}
                    to it. Swap anyway.
                  </span>
                </label>
              )}
              <PrimaryButton
                onClick={() => setStep("review")}
                disabled={!quote || insufficient || (highImpact && !ackImpact)}
              >
                {insufficient ? `Insufficient ${pay.symbol}` : "Review swap"}
              </PrimaryButton>
            </div>
          </div>
        )}
        {step === "select" && (
          <div className="pt-1 pb-3">
            <TokenPicker
              selected={(selectSide === "pay" ? pay : receive).symbol}
              onPick={pickToken}
            />
          </div>
        )}
        {step === "review" && quote && (
          <ReviewScreen
            pay={pay}
            receive={receive}
            quote={quote}
            slippage={slippage}
            onConfirm={() => setStep("success")}
          />
        )}
        {step === "success" && quote && (
          <div className="flex grow flex-col items-center justify-center gap-3 px-4 pt-6 pb-4">
            <SuccessCheck />
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-primary">Swapped</span>
              <span className="text-sm text-secondary tabular-nums">
                {`${formatAmount(quote.payAmount, locale)} ${pay.symbol} → `}
                <span className="font-medium text-primary">
                  {`${formatAmount(quote.receiveAmount, locale)} ${receive.symbol}`}
                </span>
              </span>
              <span className="text-xs text-muted">Filled at the best of 4 quoted venues</span>
            </div>
            <div className="w-full pt-3">
              <PrimaryButton onClick={reset}>Done</PrimaryButton>
            </div>
          </div>
        )}
      </WalletFrame>
    </DemoShell>
  );
};
