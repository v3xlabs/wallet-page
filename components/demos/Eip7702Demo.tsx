"use client";

import { useState } from "react";
import type { Address, Hex } from "viem";
import { hexToNumber } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

/** Placeholder delegator — wallets should reject or whitelist, not sign blindly. */
const DEFAULT_DELEGATOR =
  "0x0000000000000000000000000000000000000001" as Address;

type ProbeRow = {
  method: string;
  ok: boolean;
  detail: string;
};

async function tryRpc(
  provider: Parameters<typeof rpc>[0],
  method: string,
  params: unknown[],
): Promise<ProbeRow> {
  try {
    const result = await rpc(provider, method, params);
    return {
      method,
      ok: true,
      detail:
        typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2),
    };
  }
  catch (err) {
    return { method, ok: false, detail: formatError(err) };
  }
}

export function Eip7702Demo() {
  const { session } = useWallet();
  const [delegator, setDelegator] = useState(DEFAULT_DELEGATOR);
  const [probes, setProbes] = useState<string>();
  const [capabilities, setCapabilities] = useState<string>();
  const [type4Result, setType4Result] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const chainIdNum = () => {
    if (!session) return 1;
    return hexToNumber(session.chainId as Hex);
  };

  const probeSignMethods = async () => {
    if (!session) return;
    setPending(true);
    setProbes(undefined);
    setError(undefined);
    const from = session.accounts[0];
    const chainId = session.chainId;
    const chainIdNumber = chainIdNum();
    const rows: ProbeRow[] = [];

    const signCandidates: { method: string; params: unknown[] }[] = [
      {
        method: "wallet_signAuthorization",
        params: [
          {
            address: delegator,
            chainId,
            nonce: "0x0",
          },
        ],
      },
      {
        method: "eth_signAuthorization",
        params: [
          {
            address: delegator,
            chainId,
            nonce: "0x0",
          },
        ],
      },
      {
        method: "eth_sign7702Authorization",
        params: [
          {
            contract: delegator,
            chain_id: chainIdNumber,
            nonce: 0,
          },
        ],
      },
      {
        method: "wallet_signEip7702Authorization",
        params: [
          {
            contractAddress: delegator,
            chainId: chainIdNumber,
            nonce: 0,
          },
        ],
      },
      {
        method: "wallet_prepareAuthorization",
        params: [
          {
            address: delegator,
            chainId,
          },
        ],
      },
      {
        method: "wallet_getCapabilities",
        params: [from],
      },
    ];

    for (const { method, params } of signCandidates) {
      rows.push(await tryRpc(session.provider, method, params));
    }

    setProbes(JSON.stringify(rows, null, 2));
    setPending(false);
  };

  const probeCapabilitiesOnly = async () => {
    if (!session) return;
    setPending(true);
    setCapabilities(undefined);
    setError(undefined);
    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);
      setCapabilities(JSON.stringify(caps, null, 2));
    }
    catch (err) {
      setError(formatError(err));
    }
    finally {
      setPending(false);
    }
  };

  const probeType4Transaction = async () => {
    if (!session) return;
    setPending(true);
    setType4Result(undefined);
    setError(undefined);
    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [
        {
          from: session.accounts[0],
          to: session.accounts[0],
          value: "0x0",
          data: "0x",
          type: "0x4",
          authorizationList: [
            {
              address: delegator,
              chainId: session.chainId,
              nonce: "0x0",
            },
          ],
        },
      ]);
      setType4Result(`Accepted — tx hash: ${String(hash)}`);
    }
    catch (err) {
      const message = formatError(err);
      setType4Result(
        message.includes("not found")
        || message.includes("Unsupported")
        || message.includes("-32601")
        || message.includes("invalid")
        || message.includes("Invalid")
          ? `${message}\n\nGuarding type-4 / authorizationList is recommended — this outcome often means the wallet is protecting users until EIP-7702 RPCs are fully exposed.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>EIP-7702 authorizations</h3>
        <p className="wallet-demo-muted">
          Wallet teams are standardizing RPC names for authorizations and type-4
          transactions. This page probes common method names and{" "}
          <code>authorizationList</code> handling — we recommend exposing these
          through reviewed, wallet-controlled delegation flows.
        </p>
        <label className="wallet-demo-field">
          <span>Delegator contract (probe only)</span>
          <input
            type="text"
            className="wallet-demo-input"
            value={delegator}
            onChange={(e) => setDelegator(e.target.value as Address)}
            spellCheck={false}
          />
        </label>
        <div className="wallet-demo-actions">
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            disabled={pending}
            onClick={() => void probeSignMethods()}
          >
            Probe sign / prepare RPCs
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void probeCapabilitiesOnly()}
          >
            wallet_getCapabilities
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void probeType4Transaction()}
          >
            eth_sendTransaction (type 4)
          </button>
        </div>
        <ResultBlock
          label="RPC probe log"
          value={probes}
        />
        <ResultBlock label="Capabilities" value={capabilities} />
        <ResultBlock label="Type-4 send" value={type4Result} error={error} />
      </section>
    </DemoShell>
  );
}
