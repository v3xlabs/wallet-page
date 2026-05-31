"use client";

import { useMemo, useState } from "react";

import { rpc } from "../../lib/ethereum";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

export function Eip7811Demo() {
  const { session } = useWallet();
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const request = useMemo(() => {
    if (!session) return null;
    return {
      account: session.accounts[0],
      chainFilter: [session.chainId],
      assetTypeFilter: ["native", "erc20"],
    };
  }, [session]);

  const getAssets = async () => {
    if (!session || !request) return;
    setPending(true);
    setError(undefined);
    setResult(undefined);
    try {
      const assets = await rpc(session.provider, "wallet_getAssets", [request]);
      setResult(JSON.stringify(assets, null, 2));
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("not found")
        || message.includes("Unsupported")
        || message.includes("-32601")
          ? `${message}\n\nwallet_getAssets is not implemented yet — see ERC-7811 and wallet_getCapabilities (assetDiscovery).`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  const probeCapabilities = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setResult(undefined);
    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);
      setResult(JSON.stringify(caps, null, 2));
    }
    catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={
          request
            ? {
                rpc: { method: "wallet_getAssets", params: [request] },
              }
            : undefined
        }
        pending={pending}
        actions={[
          {
            label: "Get assets",
            onClick: getAssets,
            primary: true,
            disabled: !session,
          },
          {
            label: "wallet_getCapabilities",
            onClick: probeCapabilities,
            disabled: !session,
          },
        ]}
      >
        <ResultBlock label="Response" value={result} error={error} />
      </WalletActionPanel>
    </DemoShell>
  );
}
