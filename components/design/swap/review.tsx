"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { DemoToken } from "../data";
import { formatTokenAmount, usdValue } from "../data";
import { useDemoLocale, useDisplayValue } from "../locale";
import { PrimaryButton, Spinner, TokenIcon } from "../ui";
import type { Quote, Slippage } from "./shared";
import { ETH, formatAmount, minReceived, NETWORK_FEE_WEI } from "./shared";

const ReviewRow = ({ label, value, subvalue }: {
  label: string;
  value: ReactNode;
  subvalue?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 px-4 py-3">
    <span className="text-[13px] text-secondary">{label}</span>
    <span className="flex flex-col items-end gap-px text-right">
      <span className="text-[13px] font-medium text-primary tabular-nums">{value}</span>
      {subvalue !== undefined && <span className="text-xs text-muted tabular-nums">{subvalue}</span>}
    </span>
  </div>
);

export const ReviewScreen = ({ pay, receive, quote, slippage, onConfirm }: {
  pay: DemoToken;
  receive: DemoToken;
  quote: Quote;
  slippage: Slippage;
  onConfirm: () => void;
}) => {
  const locale = useDemoLocale();
  const display = useDisplayValue();
  const [swapping, setSwapping] = useState(false);

  const confirm = () => {
    setSwapping(true);
    setTimeout(onConfirm, 900);
  };

  const networkFeeUsd = usdValue(ETH, NETWORK_FEE_WEI);
  const totalFeesUsd = networkFeeUsd + quote.appFeeUsd;

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4">
        <span className="flex items-center -space-x-1.5">
          <TokenIcon symbol={pay.symbol} color={pay.color} address={pay.address} size={40} />
          <TokenIcon symbol={receive.symbol} color={receive.color} address={receive.address} size={40} />
        </span>
        <span className="text-xl font-semibold text-primary tabular-nums">
          {formatAmount(quote.payAmount, locale)}
          {" "}
          {pay.symbol}
          {" → "}
          {formatAmount(quote.receiveAmount, locale)}
          {" "}
          {receive.symbol}
        </span>
        <span className="text-sm text-muted tabular-nums">{display(quote.payUsd)}</span>
      </div>
      <div className="mx-4 mb-4 divide-y divide-(--vocs-border-color-primary) rounded-xl border border-primary bg-surfaceMuted/50">
        <ReviewRow
          label="You pay"
          value={`${formatAmount(quote.payAmount, locale)} ${pay.symbol}`}
          subvalue={display(quote.payUsd)}
        />
        <ReviewRow
          label="You receive"
          value={`${formatAmount(quote.receiveAmount, locale)} ${receive.symbol}`}
          subvalue={display(quote.receiveUsd)}
        />
        <ReviewRow
          label="Minimum received"
          value={`${formatAmount(minReceived(quote, slippage), locale)} ${receive.symbol}`}
          subvalue={`${slippage}% slippage`}
        />
        <ReviewRow
          label="Total fees"
          value={display(totalFeesUsd)}
          subvalue={`${formatTokenAmount(NETWORK_FEE_WEI, ETH, locale)} ETH network + ${display(quote.appFeeUsd)} app`}
        />
      </div>
      <div className="mt-auto px-4 pb-4">
        <PrimaryButton onClick={confirm} disabled={swapping}>
          {swapping
            ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Swapping…
                </span>
              )
            : "Confirm swap"}
        </PrimaryButton>
      </div>
    </>
  );
};
