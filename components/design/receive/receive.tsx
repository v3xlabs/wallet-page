"use client";

import { encodeQR } from "qr";
import { useMemo, useState } from "react";
import { parseUnits } from "viem";

import { SELF, TOKENS } from "../data";
import { EnsAvatar } from "../ens-avatar";
import { NetworkSelect } from "../network-select";
import { truncate } from "../send/shared";
import { DemoShell } from "../shell";
import { Field, PrimaryButton, WalletFrame, WalletHeader } from "../ui";

/**
 * Receiving is just sharing an address. The QR can carry the raw address, or
 * an EIP-681 link that also prefills network, asset and amount on the
 * sender's side.
 */

type Mode = "raw" | "eip-681";

const ETH = TOKENS[0];

/** Base-units amount for the URL; undefined while the input is unparsable. */
const parseAmount = (text: string, decimals: number) => {
  if (!/^\d+(\.\d+)?$/.test(text.trim())) return;

  try {
    return parseUnits(text.trim(), decimals);
  }
  catch {
    return;
  }
};

export const ReceiveDemo = () => {
  const [mode, setMode] = useState<Mode>("raw");
  const [networkId, setNetworkId] = useState(1);
  const [symbol, setSymbol] = useState(ETH.symbol);
  const [amountText, setAmountText] = useState("1");

  const token = TOKENS.find(entry => entry.symbol === symbol) ?? ETH;
  const native = token.symbol === "ETH";
  const amount = parseAmount(amountText, token.decimals) ?? 0n;

  const url
    = mode === "raw"
      ? SELF.address
      : (native
          ? `ethereum:${SELF.address}@${networkId}/?value=${amount}`
          : `ethereum:${token.address}@${networkId}/transfer?uint256=${amount}&address=${SELF.address}`);

  const qr = useMemo(() => encodeQR(url, "svg", {}), [url]);

  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DemoShell
      source="components/design/receive/receive.tsx"
      controls={{
        format: {
          type: "tabs",
          options: [
            { value: "raw", label: "Raw address" },
            { value: "eip-681", label: "EIP-681 link" },
          ],
          value: mode,
          onChange: value => setMode(value as Mode),
        },
      }}
    >
      <WalletFrame className="min-h-[480px]">
        <WalletHeader title="Receive" />
        <div className="flex grow flex-col items-center gap-3 px-4 pt-2 pb-4">
          <div className="rounded-2xl border border-primary bg-white p-3">
            <img
              src={`data:image/svg+xml;base64,${btoa(qr)}`}
              alt="QR code for the receive link"
              className="size-36"
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <EnsAvatar address={SELF.address} name={SELF.name} size={18} />
              {SELF.name}
            </span>
            <span title={SELF.address} className="font-mono text-xs text-muted">
              {truncate(SELF.address)}
            </span>
          </div>
          {mode === "eip-681" && (
            <div className="flex w-full flex-col gap-3 pt-1">
              <Field label="Network">
                <NetworkSelect value={networkId} onChange={setNetworkId} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Asset">
                  <span className="relative">
                    <select
                      value={symbol}
                      onChange={e => setSymbol(e.target.value)}
                      className="demo-select appearance-none pr-9 text-[13px]"
                    >
                      {TOKENS.map(entry => (
                        <option key={entry.symbol} value={entry.symbol}>
                          {entry.symbol}
                        </option>
                      ))}
                    </select>
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      fill="none"
                      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Field>
                <Field label={`Amount (${token.symbol})`}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountText}
                    onChange={e => setAmountText(e.target.value)}
                    placeholder="1.0"
                    spellCheck={false}
                    className="demo-input font-mono text-[13px]"
                  />
                </Field>
              </div>
            </div>
          )}
          <div className="w-full rounded-lg bg-surfaceMuted px-3 py-2 font-mono text-[11px] leading-relaxed text-secondary wrap-anywhere">
            {url}
          </div>
          <div className="mt-auto w-full pt-1">
            <PrimaryButton onClick={copy}>
              {copied ? "Copied!" : (mode === "raw" ? "Copy address" : "Copy payment link")}
            </PrimaryButton>
          </div>
        </div>
      </WalletFrame>
    </DemoShell>
  );
};
