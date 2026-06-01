"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

import { formatRpcCall, type RpcCall } from "../../lib/rpcDisplay";

export type DemoInspectorProps = {
  user?: ReactNode;
  /** JSON-RPC request (method + params). */
  request?: RpcCall;
  /** @deprecated use `request` */
  rpc?: RpcCall;
  /** Raw JSON-RPC response body. */
  response?: string;
  /** @deprecated use `response` */
  raw?: string;
  hash?: string | null;
  hashNote?: string;
  /** Style the response tab as an error (e.g. rejected RPC). */
  responseError?: boolean;
};

type TabId = "user" | "request" | "response" | "hash";

export function DemoInspector({
  user,
  request,
  rpc,
  response,
  raw,
  hash,
  hashNote,
  responseError,
}: DemoInspectorProps) {
  const baseId = useId();
  const requestCall = request ?? rpc;
  const responseBody = response ?? raw;

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [];
    if (user) list.push({ id: "user", label: "Preview" });
    if (requestCall) list.push({ id: "request", label: "Request" });
    if (responseBody) list.push({ id: "response", label: "Response" });
    if (hash) list.push({ id: "hash", label: "Hash" });
    return list;
  }, [user, requestCall, responseBody, hash]);

  const [active, setActive] = useState<TabId>(() => tabs[0]?.id ?? "request");

  useEffect(() => {
    if (!tabs.some((t) => t.id === active)) {
      setActive(tabs[0]?.id ?? "request");
    }
  }, [tabs, active]);

  const current = tabs.some((t) => t.id === active) ? active : tabs[0]?.id;

  if (tabs.length === 0) return null;

  return (
    <div className="wallet-demo-tabs">
      <div className="wallet-demo-tab-list" role="tablist" aria-label="Demo views">
        {tabs.map((tab) => (
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
      {current === "request" && requestCall && (
        <div
          id={`${baseId}-panel-request`}
          role="tabpanel"
          aria-labelledby={`${baseId}-request`}
          className="wallet-demo-tab-panel wallet-demo-rpc"
        >
          <pre>{formatRpcCall(requestCall)}</pre>
        </div>
      )}
      {current === "response" && responseBody && (
        <div
          id={`${baseId}-panel-response`}
          role="tabpanel"
          aria-labelledby={`${baseId}-response`}
          className={`wallet-demo-tab-panel wallet-demo-raw${responseError ? " wallet-demo-raw-error" : ""}`}
        >
          <pre className="wallet-demo-raw-pre">{responseBody}</pre>
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
