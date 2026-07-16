"use client";

import classNames from "classnames";
import { useState } from "react";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

import { formatError } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { useWallet } from "../wallet/WalletProvider";

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum.publicnode.com"),
});

export const EnsDemo = () => {
  const { session } = useWallet();

  const [forwardName, setForwardName] = useState("vitalik.eth");
  const [forwardResult, setForwardResult] = useState<string>();
  const [forwardError, setForwardError] = useState<string>();
  const [forwardPending, setForwardPending] = useState(false);

  const [reverseAddress, setReverseAddress] = useState(
    session?.accounts[0] ?? "",
  );
  const [reverseResult, setReverseResult] = useState<string>();
  const [reverseError, setReverseError] = useState<string>();
  const [reversePending, setReversePending] = useState(false);

  const lookupForward = async () => {
    const name = forwardName.trim();

    if (!name) return;

    setForwardPending(true);
    setForwardResult(undefined);
    setForwardError(undefined);

    try {
      const address = await ensClient.getEnsAddress({ name: normalize(name) });

      setForwardResult(address ?? "No address registered for this name.");
    }
    catch (error) {
      setForwardError(formatError(error));
    }
    finally {
      setForwardPending(false);
    }
  };

  const lookupReverse = async () => {
    const addr = reverseAddress.trim();

    if (!isAddress(addr)) {
      setReverseError("Enter a valid checksummed address.");

      return;
    }

    setReversePending(true);
    setReverseResult(undefined);
    setReverseError(undefined);

    try {
      const name = await ensClient.getEnsName({ address: addr as Address });

      setReverseResult(name ?? "No primary name set for this address.");
    }
    catch (error) {
      setReverseError(formatError(error));
    }
    finally {
      setReversePending(false);
    }
  };

  return (
    <DemoShell source="components/demos/ens-demo.tsx">
      <p className="mb-5 text-sm text-secondary">
        Resolves against Ethereum mainnet via a public RPC.
      </p>

      {/* Forward lookup */}
      <div className="mt-5 first:mt-0">
        <h3 className="mb-2 text-base">Forward lookup</h3>
        <p className="text-sm text-secondary">name → address</p>
        <label className="my-3 flex flex-col gap-1.5">
          <span className="text-sm text-secondary">ENS name</span>
          <input
            type="text"
            className="demo-input font-mono"
            value={forwardName}
            onChange={e => setForwardName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void lookupForward()}
            placeholder="vitalik.eth"
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="demo-btn demo-btn-primary"
            onClick={() => void lookupForward()}
            disabled={forwardPending || !forwardName.trim()}
          >
            {forwardPending ? "Resolving…" : "Resolve name"}
          </button>
        </div>
        {(forwardResult || forwardError) && (
          <div className="mt-3 rounded-md border border-primary bg-surfaceMuted px-4 py-3">
            <div className="mb-1.5 text-xs tracking-[0.04em] uppercase text-secondary">Address</div>
            <pre
              className={classNames(
                "m-0 overflow-x-auto font-mono text-[13px]",
                forwardError ? "text-destructive whitespace-pre-wrap wrap-break-word" : "text-success",
              )}
            >
              {forwardError ?? forwardResult}
            </pre>
          </div>
        )}
      </div>

      {/* Reverse lookup */}
      <div className="mt-5 first:mt-0">
        <h3 className="mb-2 text-base">Reverse lookup</h3>
        <p className="text-sm text-secondary">address → primary name</p>
        <label className="my-3 flex flex-col gap-1.5">
          <span className="text-sm text-secondary">Ethereum address</span>
          <input
            type="text"
            className="demo-input font-mono"
            value={reverseAddress}
            onChange={e => setReverseAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void lookupReverse()}
            placeholder="0x…"
          />
        </label>
        {session && reverseAddress !== session.accounts[0] && (
          <button
            type="button"
            className="demo-btn mt-1.5"
            onClick={() => setReverseAddress(session.accounts[0])}
          >
            Use wallet address
          </button>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="demo-btn demo-btn-primary"
            onClick={() => void lookupReverse()}
            disabled={reversePending || !reverseAddress.trim()}
          >
            {reversePending ? "Resolving…" : "Resolve address"}
          </button>
        </div>
        {(reverseResult || reverseError) && (
          <div className="mt-3 rounded-md border border-primary bg-surfaceMuted px-4 py-3">
            <div className="mb-1.5 text-xs tracking-[0.04em] uppercase text-secondary">Primary name</div>
            <pre
              className={classNames(
                "m-0 overflow-x-auto font-mono text-[13px]",
                reverseError ? "text-destructive whitespace-pre-wrap wrap-break-word" : "text-success",
              )}
            >
              {reverseError ?? reverseResult}
            </pre>
          </div>
        )}
      </div>
    </DemoShell>
  );
};
