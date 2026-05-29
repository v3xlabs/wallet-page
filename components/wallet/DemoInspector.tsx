"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

import { formatRpcCall, type RpcCall } from "../../lib/rpcDisplay";

export type DemoInspectorProps = {
  user?: ReactNode;
  rpc?: RpcCall;
  hash?: string | null;
  hashNote?: string;
};

type TabId = "user" | "rpc" | "hash";

export function DemoInspector({ user, rpc, hash, hashNote }: DemoInspectorProps) {
  const baseId = useId();
  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [];
    if (user) list.push({ id: "user", label: "User" });
    if (rpc) list.push({ id: "rpc", label: "RPC" });
    if (hash) list.push({ id: "hash", label: "Hash" });
    return list;
  }, [user, rpc, hash]);

  const [active, setActive] = useState<TabId>(() => tabs[0]?.id ?? "rpc");

  useEffect(() => {
    if (!tabs.some((t) => t.id === active)) {
      setActive(tabs[0]?.id ?? "rpc");
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
      {current === "rpc" && rpc && (
        <div
          id={`${baseId}-panel-rpc`}
          role="tabpanel"
          aria-labelledby={`${baseId}-rpc`}
          className="wallet-demo-tab-panel wallet-demo-rpc"
        >
          <pre>{formatRpcCall(rpc)}</pre>
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
