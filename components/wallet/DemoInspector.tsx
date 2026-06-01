"use client";

import { type ReactNode, useId, useMemo, useState } from "react";

import { formatRpcCall, type RpcCall } from "../../lib/rpcDisplay";

export type DemoInspectorProps = {
  user?: ReactNode;
  /** JSON-RPC request (method + params). */
  request?: RpcCall;
  /** Raw JSON-RPC response body. */
  response?: string;
  hash?: string | null;
  hashNote?: string;
  /** Style the response tab as an error (e.g. rejected RPC). */
  responseError?: boolean;
};

type TabId = "user" | "request" | "response" | "hash";

export function DemoInspector({
  user,
  request,
  response,
  hash,
  hashNote,
  responseError,
}: DemoInspectorProps) {
  const baseId = useId();

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string; }[] = [];

    if (user) list.push({ id: "user", label: "Preview" });

    if (request) list.push({ id: "request", label: "Request" });

    if (response) list.push({ id: "response", label: "Response" });

    if (hash) list.push({ id: "hash", label: "Hash" });

    return list;
  }, [user, request, response, hash]);

  const [active, setActive] = useState<TabId>(() => tabs[0]?.id ?? "request");

  // `active` is the user's explicit choice; fall back to the first available tab
  // whenever that choice is no longer valid (tabs are derived from props).
  const current = tabs.some(t => t.id === active) ? active : tabs[0]?.id;

  if (tabs.length === 0) return null;

  return (
    <div className="wallet-demo-tabs">
      <div className="wallet-demo-tab-list" role="tablist" aria-label="Demo views">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={current === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            className={`wallet-demo-tab${current === tab.id ? " wallet-demo-tab-active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current === "user" && user && (
        <div
          id={`${baseId}-panel-user`}
          role="tabpanel"
          aria-labelledby={`${baseId}-user`}
          className="wallet-demo-tab-panel wallet-preview"
        >
          {user}
        </div>
      )}
      {current === "request" && request && (
        <div
          id={`${baseId}-panel-request`}
          role="tabpanel"
          aria-labelledby={`${baseId}-request`}
          className="wallet-demo-tab-panel wallet-demo-rpc"
        >
          <pre>{formatRpcCall(request)}</pre>
        </div>
      )}
      {current === "response" && response && (
        <div
          id={`${baseId}-panel-response`}
          role="tabpanel"
          aria-labelledby={`${baseId}-response`}
          className={`wallet-demo-tab-panel wallet-demo-raw${responseError ? " wallet-demo-raw-error" : ""}`}
        >
          <pre className="wallet-demo-raw-pre">{response}</pre>
        </div>
      )}
      {current === "hash" && hash && (
        <div
          id={`${baseId}-panel-hash`}
          role="tabpanel"
          aria-labelledby={`${baseId}-hash`}
          className="wallet-demo-tab-panel wallet-demo-hash"
        >
          {hashNote && <p className="wallet-demo-muted wallet-demo-hash-note">{hashNote}</p>}
          <code>{hash}</code>
        </div>
      )}
    </div>
  );
}
