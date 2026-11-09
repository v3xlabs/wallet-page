"use client";

import classNames from "classnames";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { formatError, rpc } from "../../lib/ethereum";
import {
  buildCapabilityGroups,
  type CapabilityGroup,
  extractGrantedCapabilities,
  normalizePermissionsResponse,
} from "../../lib/walletPermissions";
import { useDemoFrame } from "../wallet/DemoFrame";
import { DemoShell } from "../wallet/DemoShell";
import { useWallet } from "../wallet/WalletProvider";

const CapabilityChecklist = ({ groups }: { groups: CapabilityGroup[]; }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-start gap-x-5 gap-y-2">
    {groups.map(group => (
      <ul key={group.prefix} className="m-0 flex min-w-0 list-none flex-col gap-1 p-0">
        {group.items.map(item => (
          <li key={item.id} className="flex items-baseline gap-2 text-control">
            <span
              className={classNames(
                "flex-none basis-4 text-center font-semibold select-none",
                item.granted ? "text-success" : "text-secondary",
              )}
              aria-label={item.granted ? "granted" : "not granted"}
            >
              {item.granted ? "✓" : "-"}
            </span>
            <code className="min-w-0 font-mono text-control">{item.id}</code>
          </li>
        ))}
      </ul>
    ))}
  </div>
);

export const PermissionsDemo = () => {
  const baseId = useId();
  const { session } = useWallet();
  const { requireSession } = useDemoFrame();
  const [granted, setGranted] = useState<Set<string>>(() => new Set());
  const [raw, setRaw] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"capabilities" | "raw">("capabilities");

  const groups = useMemo(() => buildCapabilityGroups(granted), [granted]);

  const getPermissions = useCallback(async () => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);

    try {
      const result = await rpc(session.provider, "wallet_getPermissions", []);
      const list = normalizePermissionsResponse(result);

      setGranted(extractGrantedCapabilities(list));
      setRaw(JSON.stringify(list, null, 2));
    }
    catch (error_) {
      setGranted(new Set());
      setRaw(undefined);
      setError(formatError(error_));
    }
    finally {
      setPending(false);
    }
  }, [session, requireSession]);

  const requestPermissions = useCallback(async () => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);

    try {
      await rpc(session.provider, "wallet_requestPermissions", [
        { eth_accounts: {} },
      ]);
      await getPermissions();
    }
    catch (error_) {
      const message = formatError(error_);

      setError(
        message.includes("4001") || message.toLowerCase().includes("reject")
          ? `${message}\n\nUser rejected the permission request (EIP-1193 code 4001).`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  }, [session, getPermissions, requireSession]);

  const revokePermissions = useCallback(async () => {
    if (!requireSession()) return;

    setPending(true);
    setError(undefined);

    try {
      await rpc(session.provider, "wallet_revokePermissions", [
        { eth_accounts: {} },
      ]);
      await getPermissions();
    }
    catch (error_) {
      const message = formatError(error_);

      setError(
        message.includes("-32601") || message.includes("not found")
          ? `${message}\n\nwallet_revokePermissions is recommended for revocable grants - some wallets are still adding support.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  }, [session, getPermissions, requireSession]);

  useEffect(() => {
    if (session) void getPermissions();
  }, [session, getPermissions]);

  return (
    <DemoShell source="components/demos/permissions-demo.tsx">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="demo-btn"
            disabled={pending}
            onClick={() => void getPermissions()}
          >
            Refresh
          </button>
          <button
            type="button"
            className="demo-btn demo-btn-primary"
            disabled={pending}
            onClick={() => void requestPermissions()}
          >
            Request permissions
          </button>
          <button
            type="button"
            className="demo-btn"
            disabled={pending}
            onClick={() => void revokePermissions()}
          >
            Revoke permissions
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex gap-5 overflow-x-auto overflow-y-hidden border-b border-primary" role="tablist" aria-label="Permission views">
            <button
              type="button"
              role="tab"
              id={`${baseId}-capabilities`}
              aria-selected={tab === "capabilities"}
              aria-controls={`${baseId}-panel-capabilities`}
              className="demo-tab"
              onClick={() => setTab("capabilities")}
            >
              Capabilities
            </button>
            <button
              type="button"
              role="tab"
              id={`${baseId}-raw`}
              aria-selected={tab === "raw"}
              aria-controls={`${baseId}-panel-raw`}
              className="demo-tab"
              onClick={() => setTab("raw")}
            >
              Response
            </button>
          </div>

          {tab === "capabilities" && (
            <div
              id={`${baseId}-panel-capabilities`}
              role="tabpanel"
              aria-labelledby={`${baseId}-capabilities`}
              className="flex flex-col gap-3 pt-3"
            >
              {!error && pending && granted.size === 0
                ? (
                    <p className="m-0 text-sm text-secondary">Loading...</p>
                  )
                : (
                    <CapabilityChecklist groups={groups} />
                  )}
              {error && (
                <pre className="m-0 font-mono text-control break-all whitespace-pre-wrap text-destructive">{error}</pre>
              )}
            </div>
          )}

          {tab === "raw" && (
            <div
              id={`${baseId}-panel-raw`}
              role="tabpanel"
              aria-labelledby={`${baseId}-raw`}
              className="pt-3"
            >
              {error
                ? (
                    <pre className="m-0 font-mono text-control break-all whitespace-pre-wrap text-destructive">{error}</pre>
                  )
                : (raw
                    ? (
                        <pre className="demo-scroll-x m-0 pb-1 font-mono text-control whitespace-pre">{raw}</pre>
                      )
                    : (
                        <p className="m-0 text-sm text-secondary">
                          {pending ? "Loading..." : "No response yet."}
                        </p>
                      ))}
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
};
