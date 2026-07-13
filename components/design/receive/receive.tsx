"use client";

import { encodeQR } from "qr";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { hoodi, mainnet, sepolia } from "viem/chains";

import { DemoShell } from "../shell";

const NETWORKS = [
  mainnet,
  sepolia,
  hoodi,
];

const inputClass
  = "w-full rounded-lg border border-primary bg-surface px-3 py-2 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accenta3";

const Field = ({ label, children }: { label: string; children: ReactNode; }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-wide text-secondary uppercase">{label}</span>
    {children}
  </label>
);

const Segmented = <T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; }[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-lg border border-primary bg-surfaceMuted p-0.5">
    {options.map(option => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${option.value === value
          ? "bg-surface text-primary"
          : "text-secondary hover:text-primary"
          }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const NetworkSelect = ({ value, onChange }: { value: number; onChange: (id: number) => void; }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={`${inputClass} cursor-pointer appearance-none pr-9`}
    >
      {NETWORKS.map(network => (
        <option key={network.id} value={network.id}>
          {network.name}
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
  </div>
);

export const ReceiveDemo = () => {
  const [mode, setMode] = useState<"raw" | "eip-681">("raw");
  const [eip681Mode, setEip681Mode] = useState<"native" | "erc-20">("native");
  const [networkId, setNetworkId] = useState<number>(1);
  const [token, setToken] = useState<string>("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [amount, setAmount] = useState<number>(1_000_000_000_000_000_000);
  const [to, setTo] = useState<string>("0x1234567890123456789012345678901234567890");
  const url = useMemo(() => {
    if (mode === "raw") return to;

    if (mode === "eip-681") {
      if (eip681Mode === "native") return `ethereum:${to}@${networkId}/?value=${amount}`;

      if (eip681Mode === "erc-20") return `ethereum:${token}@${networkId}/transfer?uint256=${amount}&address=${to}`;
    }

    return "invalid";
  }, [mode, eip681Mode, networkId, to, token, amount]);
  const qr = useMemo(() => encodeQR(url, "svg", {}), [url]);

  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DemoShell source="components/design/receive/receive.tsx">
      <div className="">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
          <div className="">
            <div className="rounded-lg bg-white p-2.5 w-fit border border-primary">
              <div className="aspect-square size-36 overflow-hidden">
                <img
                  src={`data:image/svg+xml;base64,${btoa(qr)}`}
                  alt="Receive QR code"
                  className="size-full aspect-square"
                />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex flex-col gap-4">
            <pre className="w-full rounded-md border border-primary bg-surface whitespace-pre-wrap wrap-anywhere grow">
              <code className="font-mono text-xs text-secondary p-2 block">{url}</code>
            </pre>
            <button
              type="button"
              onClick={copy}
              className="w-full rounded-lg border border-primary bg-surfaceMuted px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-surfaceTint"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <hr className="my-4 border-t border-primary" />
        <div className="flex min-w-0 flex-col gap-4">
          <Field label="URL standard">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "raw", label: "Raw address" },
                { value: "eip-681", label: "EIP-681" },
              ]}
            />
          </Field>
          <Field label="Recipient address">
            <input
              type="text"
              value={to}
              onChange={e => setTo(e.target.value)}
              spellCheck={false}
              className={`${inputClass} font-mono`}
            />
          </Field>
          {mode === "eip-681" && (
            <>
              <Field label="Network">
                <NetworkSelect value={networkId} onChange={setNetworkId} />
              </Field>
              <Field label="Asset">
                <Segmented
                  value={eip681Mode}
                  onChange={setEip681Mode}
                  options={[
                    { value: "native", label: "Native (ETH)" },
                    { value: "erc-20", label: "ERC-20" },
                  ]}
                />
              </Field>
              {eip681Mode === "erc-20" && (
                <Field label="Token contract">
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    spellCheck={false}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              )}
              <Field label={eip681Mode === "erc-20" ? "Amount (base units)" : "Amount (wei)"}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  min={0}
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  );
};
