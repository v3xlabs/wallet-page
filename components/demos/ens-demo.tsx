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
      <div className="flex flex-col gap-6">
        <p className="m-0 text-sm text-secondary">
          Resolves against Ethereum mainnet via a public RPC.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-sm font-semibold">Forward lookup</h3>
            <p className="m-0 text-control text-secondary">name → address</p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-control text-secondary">ENS name</span>
            <input
              type="text"
              className="demo-input h-8 py-0 font-mono text-control"
              value={forwardName}
              onChange={event => setForwardName(event.target.value)}
              onKeyDown={event => event.key === "Enter" && void lookupForward()}
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
              {forwardPending ? "Resolving..." : "Resolve name"}
            </button>
          </div>
          {(forwardResult || forwardError) && (
            <div className="flex flex-col gap-2">
              <span className="text-control text-secondary">Address</span>
              <p
                className={classNames(
                  "m-0 font-mono text-control",
                  forwardError ? "text-destructive whitespace-pre-wrap wrap-break-word" : "text-success break-all text-balance",
                )}
              >
                {forwardError ?? forwardResult}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-sm font-semibold">Reverse lookup</h3>
            <p className="m-0 text-control text-secondary">address → primary name</p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-control text-secondary">Ethereum address</span>
            <input
              type="text"
              className="demo-input h-8 py-0 font-mono text-control"
              value={reverseAddress}
              onChange={event => setReverseAddress(event.target.value)}
              onKeyDown={event => event.key === "Enter" && void lookupReverse()}
              placeholder="0x..."
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            {session && reverseAddress !== session.accounts[0] && (
              <button
                type="button"
                className="demo-btn"
                onClick={() => setReverseAddress(session.accounts[0])}
              >
                Use wallet address
              </button>
            )}
            <button
              type="button"
              className="demo-btn"
              onClick={() => void lookupReverse()}
              disabled={reversePending || !reverseAddress.trim()}
            >
              {reversePending ? "Resolving..." : "Resolve address"}
            </button>
          </div>
          {(reverseResult || reverseError) && (
            <div className="flex flex-col gap-2">
              <span className="text-control text-secondary">Primary name</span>
              <p
                className={classNames(
                  "m-0 font-mono text-control",
                  reverseError ? "text-destructive whitespace-pre-wrap wrap-break-word" : "text-success break-all",
                )}
              >
                {reverseError ?? reverseResult}
              </p>
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
};
