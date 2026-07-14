"use client";

import classNames from "classnames";
import { useState } from "react";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { hoodi, sepolia } from "viem/chains";

import { DemoShell } from "../shell";
import { PrimaryButton, TokenIcon, WalletFrame, WalletHeader } from "../ui";
import { HOODI_COLOR } from "./shared";

/**
 * Networks are just… on. No health meters, no default radio — silence means
 * working. The interesting surface is configuration: every network's RPCs
 * are the user's to edit, extend, and swap between.
 */

type Rpc = {
  url: string;
  /** The one state worth surfacing — everything else stays quiet. */
  unreachable?: boolean;
};

type Network = {
  id: number;
  name: string;
  symbol: string;
  color: string;
  testnet?: boolean;
  custom?: boolean;
  rpcs: Rpc[];
  /** Index of the RPC currently in use. */
  active: number;
};

const INITIAL: Network[] = [
  {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    color: "#627eea",
    rpcs: [
      { url: "https://ethereum.publicnode.com" },
      { url: "https://rpc.eth.example.org" },
    ],
    active: 0,
  },
  {
    id: sepolia.id,
    name: "Sepolia",
    symbol: "ETH",
    color: "#9e77ed",
    testnet: true,
    rpcs: [{ url: "https://sepolia.publicnode.com" }],
    active: 0,
  },
  {
    id: hoodi.id,
    name: "Hoodi",
    symbol: "ETH",
    color: HOODI_COLOR,
    testnet: true,
    rpcs: [
      { url: "https://rpc.hoodi.example.org", unreachable: true },
      { url: "https://hoodi.publicnode.com" },
    ],
    active: 1,
  },
];

const host = (url: string) => url.replace(/^\w+:\/\//, "").replace(/\/.*$/, "");

/** Quiet caption normally; speaks up only when an RPC is down. */
const rowCaption = (network: Network) => {
  const active = network.rpcs[network.active];

  if (active.unreachable) {
    return { tone: "text-destructive", text: "RPC unreachable" };
  }

  if (network.rpcs.some(rpc => rpc.unreachable)) {
    return { tone: "text-warning", text: `Using fallback · ${host(active.url)}` };
  }

  return { tone: "text-muted", text: host(active.url) };
};

const RpcRow = ({ rpc, active, onUse }: { rpc: Rpc; active: boolean; onUse: () => void; }) => (
  <button
    type="button"
    onClick={onUse}
    disabled={active}
    className={classNames(
      "group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
      !active && "cursor-pointer hover:bg-surfaceMuted",
    )}
  >
    <span
      className={classNames(
        "truncate font-mono text-xs",
        rpc.unreachable ? "text-muted line-through" : "text-secondary",
      )}
    >
      {host(rpc.url)}
    </span>
    {active
      ? <span className="shrink-0 text-[11px] font-medium text-accent">In use</span>
      : (rpc.unreachable
          ? <span className="shrink-0 text-[11px] text-destructive">Unreachable</span>
          : (
              <span className="shrink-0 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                Use
              </span>
            ))}
  </button>
);

const NetworkPanel = ({ network, onUseRpc, onAddRpc }: {
  network: Network;
  onUseRpc: (index: number) => void;
  onAddRpc: (url: string) => void;
}) => {
  const [draft, setDraft] = useState("");
  const valid = /^https?:\/\/.+\../.test(draft.trim());

  return (
    <div className="mx-4 mb-3 flex flex-col gap-1 border-b border-primary pb-3">
      <span className="px-2 pb-0.5 text-[11px] font-medium tracking-wide text-muted uppercase">
        RPC endpoints
      </span>
      {network.rpcs.map((rpc, index) => (
        <RpcRow
          key={rpc.url}
          rpc={rpc}
          active={index === network.active}
          onUse={() => onUseRpc(index)}
        />
      ))}
      <form
        className="flex items-center gap-1.5 px-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();

          if (!valid) return;

          onAddRpc(draft.trim());
          setDraft("");
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="https://…"
          spellCheck={false}
          className="w-full rounded-md border border-primary bg-surface px-2 py-1 font-mono text-xs text-primary outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={!valid}
          className="shrink-0 cursor-pointer rounded-md border border-primary bg-surfaceMuted px-2 py-1 text-[11px] font-medium text-secondary transition-colors enabled:hover:bg-surfaceTint enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          Add RPC
        </button>
      </form>
      <div className="flex items-center justify-between gap-2 border-t border-primary px-2 pt-1.5 pb-0.5">
        <span className="text-[11px] text-muted">Native token</span>
        <span className="text-[11px] font-medium text-secondary">{network.symbol}</span>
      </div>
    </div>
  );
};

const NetworkRow = ({ network, expanded, onToggle, onUseRpc, onAddRpc }: {
  network: Network;
  expanded: boolean;
  onToggle: () => void;
  onUseRpc: (index: number) => void;
  onAddRpc: (url: string) => void;
}) => {
  const caption = rowCaption(network);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surfaceMuted"
      >
        <TokenIcon symbol={network.name} color={network.color} size={32} />
        <span className="flex min-w-0 grow flex-col gap-px">
          <span className="truncate text-sm font-medium text-primary">{network.name}</span>
          <span className={classNames("truncate font-mono text-[11px]", caption.tone)}>
            {caption.text}
          </span>
        </span>
        <FiChevronDown
          className={classNames(
            "size-4 shrink-0 text-muted transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && (
        <NetworkPanel network={network} onUseRpc={onUseRpc} onAddRpc={onAddRpc} />
      )}
    </div>
  );
};

/* --------------------------------- add form --------------------------------- */

const FormField = ({ label, children }: { label: string; children: React.ReactNode; }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[11px] font-medium tracking-wide text-secondary uppercase">{label}</span>
    {children}
  </label>
);

const AddNetworkScreen = ({ taken, onAdd }: {
  taken: number[];
  onAdd: (network: Network) => void;
}) => {
  const [name, setName] = useState("");
  const [rpc, setRpc] = useState("");
  const [symbol, setSymbol] = useState("ETH");
  const [id, setId] = useState("");

  const idNumber = Number(id);
  const duplicate = id !== "" && taken.includes(idNumber);
  const valid
    = name.trim() !== ""
      && /^https?:\/\/.+\../.test(rpc.trim())
      && /^[A-Za-z]{2,6}$/.test(symbol.trim())
      && Number.isInteger(idNumber)
      && idNumber > 0
      && !duplicate;

  return (
    <div className="flex grow flex-col gap-3.5 px-4 pt-1 pb-4">
      <FormField label="Name">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My network"
          className="demo-input text-[13px]"
        />
      </FormField>
      <FormField label="RPC URL">
        <input
          type="text"
          value={rpc}
          onChange={e => setRpc(e.target.value)}
          placeholder="https://rpc.mynetwork.org"
          spellCheck={false}
          className="demo-input font-mono text-[13px]"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Token symbol">
          <input
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="ETH"
            className="demo-input text-[13px] uppercase"
          />
        </FormField>
        <FormField label="Network id">
          <input
            type="text"
            inputMode="numeric"
            value={id}
            onChange={e => setId(e.target.value.replaceAll(/\D/g, ""))}
            placeholder="1"
            className="demo-input font-mono text-[13px]"
          />
        </FormField>
      </div>
      {duplicate && (
        <p className="text-xs text-warning">
          You already have a network with id
          {" "}
          {idNumber}
          .
        </p>
      )}
      <div className="mt-auto pt-2">
        <PrimaryButton
          disabled={!valid}
          onClick={() =>
            onAdd({
              id: idNumber,
              name: name.trim(),
              symbol: symbol.trim().toUpperCase(),
              color: "#8b8fa3",
              custom: true,
              rpcs: [{ url: rpc.trim() }],
              active: 0,
            })}
        >
          Add network
        </PrimaryButton>
      </div>
    </div>
  );
};

/* ----------------------------------- demo ----------------------------------- */

export const NetworkListDemo = () => {
  const [networks, setNetworks] = useState(INITIAL);
  const [expandedId, setExpandedId] = useState<number>();
  const [adding, setAdding] = useState(false);

  const update = (id: number, patch: (network: Network) => Network) =>
    setNetworks(current => current.map(network => (network.id === id ? patch(network) : network)));

  const row = (network: Network) => (
    <NetworkRow
      key={network.id}
      network={network}
      expanded={network.id === expandedId}
      onToggle={() => setExpandedId(network.id === expandedId ? undefined : network.id)}
      onUseRpc={index => update(network.id, current => ({ ...current, active: index }))}
      onAddRpc={url =>
        update(network.id, current => ({ ...current, rpcs: [...current.rpcs, { url }] }))}
    />
  );

  const mains = networks.filter(network => !network.testnet);
  const tests = networks.filter(network => network.testnet);

  return (
    <DemoShell source="components/design/networks/list.tsx">
      <WalletFrame className="min-h-[480px]">
        <WalletHeader
          title={adding ? "Add network" : "Networks"}
          onBack={adding ? () => setAdding(false) : undefined}
          right={!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              aria-label="Add a network"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-surfaceMuted hover:text-primary"
            >
              <FiPlus className="size-4" />
            </button>
          )}
        />
        {adding
          ? (
              <AddNetworkScreen
                taken={networks.map(network => network.id)}
                onAdd={(network) => {
                  setNetworks(current => [...current, network]);
                  setAdding(false);
                  setExpandedId(network.id);
                }}
              />
            )
          : (
              <div className="flex grow flex-col pt-1 pb-3">
                {mains.map(network => row(network))}
                {tests.length > 0 && (
                  <span className="px-4 pt-3 pb-1 text-[11px] font-medium tracking-wide text-muted uppercase">
                    Testnets
                  </span>
                )}
                {tests.map(network => row(network))}
              </div>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
