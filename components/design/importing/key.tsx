"use client";

import { useMemo, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { EnsAvatar } from "../ens-avatar";
import { PrimaryButton, Spinner } from "../ui";
import type { ImportResult } from "./shared";
import { DEMO_PRIVATE_KEY, truncate } from "./shared";

const KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/;

/**
 * Private-key import: masked by default, derived address shown live, and an
 * unmissable reminder that a raw key has no safety net.
 */
export const KeyScreen = ({ onImport }: { onImport: (result: ImportResult) => void; }) => {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const [importing, setImporting] = useState(false);

  const trimmed = text.trim();
  const valid = KEY_PATTERN.test(trimmed);

  const account = useMemo(() => {
    if (!KEY_PATTERN.test(trimmed)) return;

    try {
      return privateKeyToAccount(trimmed as Hex);
    }
    catch {
      return;
    }
  }, [trimmed]);

  const startImport = () => {
    if (!account) return;

    setImporting(true);
    setTimeout(() => onImport({ address: account.address, name: "Account 1" }), 700);
  };

  return (
    <div className="flex grow flex-col gap-2.5 px-4 pt-2 pb-4">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          className="demo-input pr-9 font-mono text-[13px]"
        />
        <button
          type="button"
          onClick={() => setVisible(current => !current)}
          aria-label={visible ? "Hide private key" : "Show private key"}
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surfaceMuted hover:text-primary"
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {trimmed === ""
            ? "64 hex characters, 0x-prefixed"
            : (valid ? "Key format valid" : "Expecting 0x + 64 hex characters")}
        </span>
        <button
          type="button"
          onClick={() => setText(DEMO_PRIVATE_KEY)}
          className="cursor-pointer rounded-md px-1 py-0.5 text-xs text-accent transition-colors hover:underline"
        >
          Use the demo key
        </button>
      </div>
      <p className="rounded-xl bg-warning-tint px-3 py-2.5 text-xs leading-relaxed text-warning">
        A raw key has no backup phrase — anyone who ever saw it controls the account forever.
      </p>
      {account && (
        <div className="mt-auto flex flex-col gap-3 border-t border-primary pt-3">
          <div className="flex items-center gap-3 px-1">
            <EnsAvatar address={account.address} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-primary">Account 1</span>
              <span className="font-mono text-xs text-muted" title={account.address}>
                {truncate(account.address)}
              </span>
            </span>
          </div>
          <PrimaryButton onClick={startImport} disabled={importing}>
            {importing
              ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Importing…
                  </span>
                )
              : "Import account"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
