"use client";

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

function CapabilityChecklist({ groups }: { groups: CapabilityGroup[]; }) {
  return (
    <div className="wallet-perm-checklist">
      {groups.map(group => (
        <ul key={group.prefix} className="wallet-perm-opcode-list">
          {group.items.map(item => (
            <li key={item.id}>
              <span
                className={`wallet-perm-mark${item.granted ? " wallet-perm-mark-yes" : ""}`}
                aria-label={item.granted ? "granted" : "not granted"}
              >
                {item.granted ? "✓" : "−"}
              </span>
              <code>{item.id}</code>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function PermissionsDemo() {
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
          ? `${message}\n\nwallet_revokePermissions is recommended for revocable grants — some wallets are still adding support.`
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
      <div className="wallet-perm-demo">
        <div className="wallet-demo-actions wallet-perm-demo-toolbar">
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void getPermissions()}
          >
            Refresh
          </button>
          <button
            type="button"
            className="wallet-demo-btn wallet-demo-btn-primary"
            disabled={pending}
            onClick={() => void requestPermissions()}
          >
            Request permissions
          </button>
          <button
            type="button"
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void revokePermissions()}
          >
            Revoke permissions
          </button>
        </div>

        <div className="wallet-demo-tabs">
          <div className="wallet-demo-tab-list" role="tablist" aria-label="Permission views">
            <button
              type="button"
              role="tab"
              id={`${baseId}-capabilities`}
              aria-selected={tab === "capabilities"}
              aria-controls={`${baseId}-panel-capabilities`}
              className={`wallet-demo-tab${tab === "capabilities" ? " wallet-demo-tab-active" : ""}`}
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
              className={`wallet-demo-tab${tab === "raw" ? " wallet-demo-tab-active" : ""}`}
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
              className="wallet-demo-tab-panel wallet-perm-tab-panel"
            >
              {pending && granted.size === 0 && !error
                ? (
                    <p className="wallet-demo-muted">Loading…</p>
                  )
                : (
                    <CapabilityChecklist groups={groups} />
                  )}
              {error && (
                <pre className="wallet-perm-error">{error}</pre>
              )}
            </div>
          )}

          {tab === "raw" && (
            <div
              id={`${baseId}-panel-raw`}
              role="tabpanel"
              aria-labelledby={`${baseId}-raw`}
              className="wallet-demo-tab-panel wallet-demo-rpc"
            >
              {error
                ? (
                    <pre className="wallet-perm-error">{error}</pre>
                  )
                : (raw
                    ? (
                        <pre>{raw}</pre>
                      )
                    : (
                        <p className="wallet-demo-muted">
                          {pending ? "Loading…" : "No response yet."}
                        </p>
                      ))}
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
