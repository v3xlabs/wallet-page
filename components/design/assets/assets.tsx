"use client";

import { useState } from "react";

import type { DemoToken } from "../data";
import { fiatValue, formatUsd, TOKENS } from "../data";
import { DemoShell } from "../shell";
import { WalletFrame, WalletHeader } from "../ui";
import { DiscoveredSection } from "./discovered";
import { HiddenShelf, TokenRow } from "./rows";
import type { DiscoveredToken } from "./tokens";
import { DISCOVERED, DUST_TOKENS } from "./tokens";

/** WETH starts out in the Discovered section, not the primary list. */
const INITIAL_TOKENS = TOKENS.filter(token => token.symbol !== "WETH");

export const AssetsDemo = () => {
  const [tokens, setTokens] = useState<DemoToken[]>(INITIAL_TOKENS);
  const [hiddenSymbols, setHiddenSymbols] = useState<string[]>([]);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string>();
  const [discovered, setDiscovered] = useState(DISCOVERED);
  const [justAdded, setJustAdded] = useState<string>();

  const visible = tokens.filter(token => !hiddenSymbols.includes(token.symbol));
  const userHidden = tokens.filter(token => hiddenSymbols.includes(token.symbol));
  const total = visible.reduce((sum, token) => sum + fiatValue(token, token.balance), 0);

  const hide = (symbol: string) => {
    setHiddenSymbols(current => [...current, symbol]);
    setMenuFor(undefined);
  };

  const add = (item: DiscoveredToken) => {
    setDiscovered(current => current.filter(candidate => candidate !== item));
    setTokens(current => [...current, item.token]);
    setJustAdded(item.token.symbol);
  };

  return (
    <DemoShell source="components/design/assets/assets.tsx">
      <WalletFrame className="min-h-[480px]">
        <WalletHeader title="Tokens" />
        <div className="flex flex-col items-start gap-0.5 px-4 pt-2 pb-3">
          <span className="text-3xl font-semibold text-primary tabular-nums">
            {formatUsd(total)}
          </span>
          <span className="text-xs text-muted">
            {visible.length}
            {" "}
            tokens · Ethereum
          </span>
        </div>
        <div className="flex flex-col">
          {visible.map(token => (
            <TokenRow
              key={token.symbol}
              token={token}
              menuOpen={menuFor === token.symbol}
              onToggleMenu={() =>
                setMenuFor(current => (current === token.symbol ? undefined : token.symbol))}
              onHide={() => hide(token.symbol)}
              justAdded={justAdded === token.symbol}
            />
          ))}
          <HiddenShelf
            dust={DUST_TOKENS}
            userHidden={userHidden}
            open={shelfOpen}
            onToggle={() => setShelfOpen(open => !open)}
            onShow={symbol =>
              setHiddenSymbols(current => current.filter(hidden => hidden !== symbol))}
          />
        </div>
        <DiscoveredSection
          items={discovered}
          onAdd={add}
          onDismiss={item =>
            setDiscovered(current => current.filter(candidate => candidate !== item))}
        />
        <style>
          {"@keyframes design-token-in { from { opacity: 0; transform: translateY(6px); } }"}
        </style>
      </WalletFrame>
    </DemoShell>
  );
};
