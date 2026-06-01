"use client";

import { useState } from "react";
import type { Address } from "viem";

import { formatDemoOutput, formatError, rpc } from "../../lib/ethereum";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { WalletActionPanel } from "../wallet/preview/WalletActionPanel";
import { useWallet } from "../wallet/WalletProvider";

const WATCH_PARAMS = [
  {
    type: "ERC20",
    options: {
      address: "0x779877A7B0D9E8603169DdbD7836e478b462Ed970" as Address,
      symbol: "LINK",
      decimals: 18,
      image:
        "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/link.svg",
    },
  },
] as const;

export function Eip747Demo() {
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const watchAsset = async () => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);
    setResponse(undefined);

    try {
      const added = await rpc(session.provider, "wallet_watchAsset", [
        ...WATCH_PARAMS,
      ]);

      setResponse(formatDemoOutput(added));
    }
    catch (error_) {
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  };

  return (
    <DemoShell>
      <p className="wallet-demo-muted">
        Suggests Sepolia LINK metadata to the wallet UI.
      </p>
      <WalletActionPanel
        inspector={{
          request: { method: "wallet_watchAsset", params: [...WATCH_PARAMS] },
        }}
        response={response}
        error={error}
        pending={pending}
        actions={[
          {
            label: "Suggest token to wallet",
            onClick: watchAsset,
            primary: true,
          },
        ]}
      />
    </DemoShell>
  );
}
