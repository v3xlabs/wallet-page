"use client";

import { useState } from "react";
import type { Address } from "viem";

import type { DemoToken } from "../data";
import { TOKENS, usdValue } from "../data";
import { useDisplayValue } from "../locale";
import { DemoShell } from "../shell";
import { WalletFrame, WalletHeader } from "../ui";
import { ManageScreen } from "./manage";
import { HiddenShelf, TokenRow } from "./rows";
import type { DiscoveredToken } from "./tokens";
import { DISCOVERED, DUST_TOKENS } from "./tokens";

/**
 * The wallet-wide catalog: every token any account holds or added. WETH is
 * enabled on another account only, so it starts unticked here.
 */
const INITIAL_CATALOG = [...TOKENS, ...DUST_TOKENS];

const INITIAL_ENABLED = INITIAL_CATALOG
  .filter(token => token.symbol !== "WETH")
  .map(token => token.symbol);

const DUST_SYMBOLS = new Set(DUST_TOKENS.map(token => token.symbol));

export const AssetsDemo = () => {
  const display = useDisplayValue();
  const [screen, setScreen] = useState<"list" | "manage">("list");
  const [catalog, setCatalog] = useState<DemoToken[]>(INITIAL_CATALOG);
  const [enabledSymbols, setEnabledSymbols] = useState<string[]>(INITIAL_ENABLED);
  const [hiddenSymbols, setHiddenSymbols] = useState<string[]>([]);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string>();
  const [discovered, setDiscovered] = useState(DISCOVERED);
  const [justAdded, setJustAdded] = useState<string>();
  const [customCount, setCustomCount] = useState(0);

  const enabled = catalog.filter(token => enabledSymbols.includes(token.symbol));
  const listed = enabled.filter(token => !DUST_SYMBOLS.has(token.symbol));
  const visible = listed.filter(token => !hiddenSymbols.includes(token.symbol));
  const userHidden = listed.filter(token => hiddenSymbols.includes(token.symbol));
  const dust = enabled.filter(token => DUST_SYMBOLS.has(token.symbol));
  const total = visible.reduce((sum, token) => sum + usdValue(token, token.balance), 0);

  const hide = (symbol: string) => {
    setHiddenSymbols(current => [...current, symbol]);
    setMenuFor(undefined);
  };

  const toggle = (symbol: string) => {
    if (!enabledSymbols.includes(symbol)) setJustAdded(symbol);

    setEnabledSymbols(current =>
      (current.includes(symbol)
        ? current.filter(candidate => candidate !== symbol)
        : [...current, symbol]));
  };

  const addCustom = (address: Address) => {
    const index = customCount + 1;
    const token: DemoToken = {
      symbol: index === 1 ? "TKN" : `TKN${index}`,
      name: "Custom token",
      decimals: 18,
      address,
      color: "#8a8f98",
      balance: 0n,
      priceUsd: 0,
      change24h: 0,
    };

    setCustomCount(index);
    setCatalog(current => [...current, token]);
    setEnabledSymbols(current => [...current, token.symbol]);
    setJustAdded(token.symbol);
  };

  const addDiscovered = (item: DiscoveredToken) => {
    setDiscovered(current => current.filter(candidate => candidate !== item));
    setCatalog(current => [...current, item.token]);
    setEnabledSymbols(current => [...current, item.token.symbol]);
    setJustAdded(item.token.symbol);
  };

  return (
    <DemoShell
      source="components/design/assets/assets.tsx"
      i18n
    >
      <WalletFrame>
        {screen === "manage"
          ? (
              <>
                <WalletHeader title="Manage tokens" onBack={() => setScreen("list")} />
                <ManageScreen
                  catalog={catalog}
                  enabledSymbols={enabledSymbols}
                  onToggle={toggle}
                  onAddCustom={addCustom}
                  discovered={discovered}
                  onAddDiscovered={addDiscovered}
                  onDismissDiscovered={item =>
                    setDiscovered(current => current.filter(candidate => candidate !== item))}
                />
              </>
            )
          : (
              <>
                <WalletHeader title="Tokens" />
                <div className="flex flex-col items-start gap-0.5 px-4 pt-2 pb-3">
                  <span className="text-3xl font-semibold text-primary tabular-nums">
                    {display(total)}
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs text-muted">
                      {`${visible.length} tokens · Ethereum`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScreen("manage")}
                      className="cursor-pointer text-xs font-medium text-accent hover:underline"
                    >
                      Manage
                    </button>
                  </div>
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
                    dust={dust}
                    userHidden={userHidden}
                    open={shelfOpen}
                    onToggle={() => setShelfOpen(open => !open)}
                    onShow={symbol =>
                      setHiddenSymbols(current => current.filter(hidden => hidden !== symbol))}
                  />
                </div>
                <style>
                  {"@keyframes design-token-in { from { opacity: 0; transform: translateY(6px); } }"}
                </style>
              </>
            )}
      </WalletFrame>
    </DemoShell>
  );
};
