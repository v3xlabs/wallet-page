"use client";

import { useCallback, useEffect, useState } from "react";

import { rpc } from "../../lib/ethereum";
import {
  decodePermission,
  normalizePermissionsResponse,
  PERMISSION_REQUEST_PRESETS,
  type DecodedPermission,
  type WalletPermissionLike,
} from "../../lib/walletPermissions";
import { DemoShell } from "../wallet/DemoShell";
import { ResultBlock } from "./ResultBlock";
import { useWallet } from "../wallet/WalletProvider";

function PermissionCard({ decoded }: { decoded: DecodedPermission }) {
  return (
    <article className="wallet-perm-card">
      <header className="wallet-perm-card-header">
        <h4>{decoded.title}</h4>
        <code className="wallet-perm-capability">{decoded.parentCapability}</code>
      </header>
      <p className="wallet-demo-muted">{decoded.summary}</p>
      {(decoded.invoker || decoded.grantedAt) && (
        <dl className="wallet-perm-meta">
          {decoded.invoker && (
            <>
              <dt>Invoker</dt>
              <dd>{decoded.invoker}</dd>
            </>
          )}
          {decoded.grantedAt && (
            <>
              <dt>Granted</dt>
              <dd>{decoded.grantedAt}</dd>
            </>
          )}
        </dl>
      )}
      {decoded.caveats.length > 0 && (
        <div className="wallet-perm-caveats">
          <p className="wallet-perm-caveats-label">Caveats</p>
          <ul>
            {decoded.caveats.map((caveat) => (
              <li key={caveat.type}>
                <strong>{caveat.type}</strong>
                <span>{caveat.summary}</span>
                <details>
                  <summary>Raw value</summary>
                  <pre>{caveat.rawValue}</pre>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
      {decoded.specUrl && (
        <p className="wallet-perm-link">
          <a href={decoded.specUrl} target="_blank" rel="noreferrer">
            Related spec / docs
          </a>
        </p>
      )}
    </article>
  );
}

export function PermissionsDemo() {
  const { session } = useWallet();
  const [decoded, setDecoded] = useState<DecodedPermission[]>([]);
  const [raw, setRaw] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [emptyNote, setEmptyNote] = useState<string>();
  const [revokeNote, setRevokeNote] = useState<string>();

  const applyResult = useCallback((permissions: WalletPermissionLike[]) => {
    setDecoded(permissions.map(decodePermission));
    setRaw(JSON.stringify(permissions, null, 2));
  }, []);

  const getPermissions = useCallback(async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setRevokeNote(undefined);
    setEmptyNote(undefined);
    try {
      const result = await rpc(session.provider, "wallet_getPermissions", []);
      const list = normalizePermissionsResponse(result);
      applyResult(list);
      if (list.length === 0) {
        setEmptyNote(
          "No permissions yet — grant one with a request below, or connect on the Connect page. Wallets on the eth_requestAccounts path may return an empty list until EIP-2255 is adopted.",
        );
      }
    }
    catch (err) {
      setDecoded([]);
      setRaw(undefined);
      setEmptyNote(undefined);
      setError(err instanceof Error ? err.message : String(err));
    }
    finally {
      setPending(false);
    }
  }, [session, applyResult]);

  const requestPermission = useCallback(
    async (params: Record<string, Record<string, unknown>>) => {
      if (!session) return;
      setPending(true);
      setError(undefined);
      setRevokeNote(undefined);
      try {
        await rpc(session.provider, "wallet_requestPermissions", [params]);
        await getPermissions();
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(
          message.includes("4001") || message.toLowerCase().includes("reject")
            ? `${message}\n\nUser rejected the permission request (EIP-1193 code 4001).`
            : message,
        );
      }
      finally {
        setPending(false);
      }
    },
    [session, applyResult, getPermissions],
  );

  const revokeAccounts = async () => {
    if (!session) return;
    setPending(true);
    setError(undefined);
    setRevokeNote(undefined);
    try {
      await rpc(session.provider, "wallet_revokePermissions", [
        { eth_accounts: {} },
      ]);
      setRevokeNote("eth_accounts permission revoked for this origin.");
      await getPermissions();
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("-32601") || message.includes("not found")
          ? `${message}\n\nwallet_revokePermissions is recommended for revocable grants — some wallets are still adding support.`
          : message,
      );
    }
    finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (session) void getPermissions();
  }, [session, getPermissions]);

  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>Current permissions</h3>
        <p className="wallet-demo-muted">
          Loaded via <code>wallet_getPermissions</code>. Each entry is a{" "}
          <code>parentCapability</code> (what the site may do) plus optional{" "}
          <code>caveats</code> (extra limits).
        </p>
        <div className="wallet-demo-actions">
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
            className="wallet-demo-btn"
            disabled={pending}
            onClick={() => void revokeAccounts()}
          >
            wallet_revokePermissions (eth_accounts)
          </button>
        </div>

        {pending && decoded.length === 0 && !error && (
          <p className="wallet-demo-muted">Loading permissions…</p>
        )}

        {decoded.length > 0 && (
          <div className="wallet-perm-decode-list">
            {decoded.map((perm) => (
              <PermissionCard
                key={`${perm.parentCapability}-${perm.invoker ?? ""}`}
                decoded={perm}
              />
            ))}
          </div>
        )}

        {emptyNote && decoded.length === 0 && !error && (
          <p className="wallet-demo-muted" role="status">
            {emptyNote}
          </p>
        )}

        {revokeNote && (
          <p className="wallet-demo-muted" role="status">
            {revokeNote}
          </p>
        )}

        <ResultBlock
          label="Raw JSON"
          value={raw}
          error={error}
        />
      </section>

      <section className="wallet-demo-section">
        <h3>Request permissions</h3>
        <p className="wallet-demo-muted">
          <code>wallet_requestPermissions</code> opens the wallet UI so users can
          grant capabilities up front (EIP-2255).
        </p>
        <ul className="wallet-perm-request-list">
          {PERMISSION_REQUEST_PRESETS.map((preset) => (
            <li key={preset.id}>
              <div className="wallet-perm-request-copy">
                <strong>{preset.label}</strong>
                <p className="wallet-demo-muted">{preset.description}</p>
                <pre className="wallet-perm-request-params">
                  {JSON.stringify(preset.params, null, 2)}
                </pre>
              </div>
              <button
                type="button"
                className="wallet-demo-btn wallet-demo-btn-primary"
                disabled={pending}
                onClick={() => void requestPermission(preset.params)}
              >
                Request
              </button>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
