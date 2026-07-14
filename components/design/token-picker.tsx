"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { erc20Abi, getAddress, isAddress } from "viem";

import { mainnetClient } from "./client";
import type { DemoToken } from "./data";
import { fiatValue, formatTokenAmount, formatUsd, TOKENS } from "./data";
import { ListRow, Spinner, TokenIcon } from "./ui";

/**
 * A token picked from the list. Tokens resolved from a pasted contract
 * address carry no balance or price — the wallet knows the metadata, not
 * the market.
 */
export type PickedToken = DemoToken & { address?: Address; resolved?: boolean; };

type Resolution =
  | { status: "resolved"; address: Address; token: PickedToken; }
  | { status: "failed"; address: Address; };

/** Deterministic fallback brand color for tokens we have no artwork for. */
const derivedColor = (address: Address) => {
  const hue = Number.parseInt(address.slice(2, 8), 16) % 360;

  return `oklch(0.62 0.15 ${hue})`;
};

/**
 * Shared token selector: the wallet's own list, searchable, and any ERC-20
 * by contract address — name, symbol and decimals are read from the chain.
 */
export const TokenPicker = ({ tokens = TOKENS, selected, onPick }: {
  tokens?: DemoToken[];
  selected?: string;
  onPick: (token: PickedToken) => void;
}) => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const pastedAddress = useMemo(() => {
    if (!isAddress(trimmed, { strict: false })) return;

    return getAddress(trimmed.toLowerCase());
  }, [trimmed]);

  const [resolution, setResolution] = useState<Resolution>();

  useEffect(() => {
    if (!pastedAddress) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const [name, symbol, decimals] = await Promise.all([
          mainnetClient.readContract({ address: pastedAddress, abi: erc20Abi, functionName: "name" }),
          mainnetClient.readContract({ address: pastedAddress, abi: erc20Abi, functionName: "symbol" }),
          mainnetClient.readContract({ address: pastedAddress, abi: erc20Abi, functionName: "decimals" }),
        ]);

        if (cancelled) return;

        setResolution({
          status: "resolved",
          address: pastedAddress,
          token: {
            symbol,
            name,
            decimals,
            color: derivedColor(pastedAddress),
            balance: 0n,
            priceUsd: 0,
            change24h: 0,
            address: pastedAddress,
            resolved: true,
          },
        });
      }
      catch {
        if (!cancelled) setResolution({ status: "failed", address: pastedAddress });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pastedAddress]);

  // Only trust a resolution that matches the address currently in the field.
  const current = resolution && resolution.address === pastedAddress ? resolution : undefined;

  const filtered = pastedAddress
    ? []
    : tokens.filter(token =>
        `${token.symbol} ${token.name}`.toLowerCase().includes(trimmed.toLowerCase()),
      );

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-2 pb-1.5">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search, or paste a token address"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="demo-input text-[13px]"
        />
      </div>
      {filtered.map(token => (
        <ListRow
          key={token.symbol}
          icon={<TokenIcon symbol={token.symbol} color={token.color} address={token.address} size={36} />}
          title={token.name}
          subtitle={`${formatTokenAmount(token.balance, token)} ${token.symbol}`}
          value={formatUsd(fiatValue(token, token.balance))}
          selected={token.symbol === selected}
          onClick={() => onPick(token)}
        />
      ))}
      {!pastedAddress && filtered.length === 0 && (
        <p className="px-4 py-3 text-xs text-muted">
          No matches in your list — paste a token&rsquo;s contract address to use it directly.
        </p>
      )}
      {pastedAddress && current === undefined && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted">
          <Spinner />
          Reading name, symbol and decimals from the contract…
        </div>
      )}
      {current?.status === "resolved" && (
        <ListRow
          icon={(
            <TokenIcon
              symbol={current.token.symbol}
              color={current.token.color}
              address={current.token.address}
              size={36}
            />
          )}
          title={current.token.name}
          subtitle={`${current.token.symbol} · ${current.token.decimals} decimals · resolved from contract`}
          onClick={() => onPick(current.token)}
        />
      )}
      {current?.status === "failed" && (
        <p className="px-4 py-3 text-xs text-destructive">
          No ERC-20 metadata at this address — it may not be a token contract.
        </p>
      )}
    </div>
  );
};
