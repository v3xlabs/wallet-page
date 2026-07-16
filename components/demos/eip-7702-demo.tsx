"use client";

import { useState } from "react";
import type { Address, Hex } from "viem";
import { hexToNumber } from "viem";

import { formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const DEFAULT_DELEGATOR
  = "0x0000000000000000000000000000000000000001" as Address;

type ProbeRow = {
  method: string;
  ok: boolean;
  detail: string;
};

const tryRpc = async (
  provider: Parameters<typeof rpc>[0],
  method: string,
  params: unknown[],
): Promise<ProbeRow> => {
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
  catch (error) {
    return { method, ok: false, detail: formatError(error) };
  }
};

export const Eip7702Demo = () => {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [delegator, setDelegator] = useState(DEFAULT_DELEGATOR);
  const [probeResponse, setProbeResponse] = useState<string>();
  const [capabilities, setCapabilities] = useState<string>();
  const [type4Result, setType4Result] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const chainIdNum = () => {
    if (!session) return 1;

    return hexToNumber(session.chainId as Hex);
  };

  const probeSignMethods = async () => {
    if (!requireSession()) return;

    setPending(true);
    setProbeResponse(undefined);
    setError(undefined);
    const from = session.accounts[0];
    const chainId = session.chainId;
    const chainIdNumber = chainIdNum();
    const rows: ProbeRow[] = [];

    const signCandidates: { method: string; params: unknown[]; }[] = [
      {
        method: "wallet_signAuthorization",
        params: [{ address: delegator, chainId, nonce: "0x0" }],
      },
      {
        method: "eth_signAuthorization",
        params: [{ address: delegator, chainId, nonce: "0x0" }],
      },
      {
        method: "eth_sign7702Authorization",
        params: [{ contract: delegator, chain_id: chainIdNumber, nonce: 0 }],
      },
      {
        method: "wallet_signEip7702Authorization",
        params: [{ contractAddress: delegator, chainId: chainIdNumber, nonce: 0 }],
      },
      {
        method: "wallet_prepareAuthorization",
        params: [{ address: delegator, chainId }],
      },
      {
        method: "wallet_getCapabilities",
        params: [from],
      },
    ];

    for (const { method, params } of signCandidates) {
      rows.push(await tryRpc(session.provider, method, params));
    }

    setProbeResponse(JSON.stringify(rows, null, 2));
    setPending(false);
  };

  const probeCapabilitiesOnly = async () => {
    if (!requireSession()) return;

    setPending(true);
    setCapabilities(undefined);
    setError(undefined);

    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);

      setCapabilities(JSON.stringify(caps, null, 2));
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  const probeType4Transaction = async () => {
    if (!requireSession()) return;

    setPending(true);
    setType4Result(undefined);
    setError(undefined);
    const tx = {
      from: session.accounts[0],
      to: session.accounts[0],
      value: "0x0",
      data: "0x",
      type: "0x4",
      authorizationList: [
        { address: delegator, chainId: session.chainId, nonce: "0x0" },
      ],
    };

    try {
      const hash = await rpc(session.provider, "eth_sendTransaction", [tx]);

      setType4Result(String(hash));
    }
    catch (error_) {
      const message = formatError(error_);

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
    <DemoShell source="components/demos/eip-7702-demo.tsx">
      <p className="text-sm text-secondary">
        Wallet teams are standardizing RPC names for authorizations and type-4
        transactions. This page probes common method names and
        {" "}
        <code>authorizationList</code>
        {" "}
        handling.
      </p>
      <label className="my-3 flex flex-col gap-1.5">
        <span className="text-sm text-secondary">Delegator contract (probe only)</span>
        <input
          type="text"
          className="demo-input font-mono"
          value={delegator}
          onChange={e => setDelegator(e.target.value as Address)}
          spellCheck={false}
        />
      </label>

      <WalletActionPanel
        inspector={{
          request: {
            method: "wallet_signAuthorization",
            params: [{ address: delegator, chainId: session?.chainId ?? "0x1", nonce: "0x0" }],
          },
        }}
        response={probeResponse}
        pending={pending}
        actions={[
          {
            label: "Probe sign / prepare RPCs",
            onClick: probeSignMethods,
            primary: true,
          },
        ]}
      />

      <WalletActionPanel
        inspector={{
          request: {
            method: "wallet_getCapabilities",
            params: [session?.accounts[0] ?? "0x…"],
          },
        }}
        response={capabilities}
        error={error}
        pending={pending}
        actions={[
          { label: "wallet_getCapabilities", onClick: probeCapabilitiesOnly },
        ]}
      />

      <WalletActionPanel
        inspector={{
          request: {
            method: "eth_sendTransaction",
            params: [{
              from: session?.accounts[0] ?? "0x…",
              to: session?.accounts[0] ?? "0x…",
              value: "0x0",
              data: "0x",
              type: "0x4",
              authorizationList: [
                { address: delegator, chainId: session?.chainId ?? "0x1", nonce: "0x0" },
              ],
            }],
          },
        }}
        response={type4Result}
        pending={pending}
        actions={[
          { label: "eth_sendTransaction (type 4)", onClick: probeType4Transaction },
        ]}
      />
    </DemoShell>
  );
};
