"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { formatError, rpc, stringifyRpcData } from "../../lib/ethereum";
import { parseWalletGetAssetsResponse } from "../../lib/walletAssets";
import { WalletAssetSearch } from "../wallet/WalletAssetSearch";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { DemoShell } from "../wallet/DemoShell";
import { useDemoFrame } from "../wallet/DemoFrame";
import { useWallet } from "../wallet/WalletProvider";

export function Eip7811Demo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [assets, setAssets] = useState<ReturnType<typeof parseWalletGetAssetsResponse>>(
    [],
  );
  const [raw, setRaw] = useState<string>();
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

  const getAssets = useCallback(async () => {
    if (!requireSession() || !request) return;
    setPending(true);
    setError(undefined);
    try {
      const response = await rpc(session.provider, "wallet_getAssets", [request]);
      setRaw(stringifyRpcData(response));
      setAssets(parseWalletGetAssetsResponse(response));
    }
    catch (err) {
      setAssets([]);
      setRaw(undefined);
      const message = formatError(err);
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
  }, [session, request, requireSession]);

  const probeCapabilities = async () => {
    if (!requireSession()) return;
    setPending(true);
    setError(undefined);
    try {
      const caps = await rpc(session.provider, "wallet_getCapabilities", [
        session.accounts[0],
      ]);
      setRaw(stringifyRpcData(caps));
    }
    catch (err) {
      setRaw(undefined);
      setError(formatError(err));
    }
    finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (session) void getAssets();
  }, [session, getAssets]);

  return (
    <DemoShell>
      <WalletActionPanel
        inspector={{
          user: (
            <>
              {error && <pre className="wallet-asset-search-error">{error}</pre>}
              <WalletAssetSearch
                assets={assets}
                loading={pending && assets.length === 0}
              />
            </>
          ),
          request: request
            ? { method: "wallet_getAssets", params: [request] }
            : { method: "wallet_getAssets", params: [{ account: "0x…", chainFilter: ["0x…"] }] },
          response: raw,
        }}
        pending={pending}
        actions={[
          {
            label: "Get assets",
            onClick: getAssets,
            primary: true,
          },
          {
            label: "wallet_getCapabilities",
            onClick: probeCapabilities,
          },
        ]}
      />
    </DemoShell>
  );
}
