"use client";

import classNames from "classnames";
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
    <div className="overflow-hidden rounded-md border border-primary bg-surfaceMuted">
      <div className="flex border-b border-primary bg-code-block" role="tablist" aria-label="Demo views">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={current === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            className={classNames(
              "cursor-pointer px-3.5 py-2 text-[13px] font-medium",
              current === tab.id
                ? "text-primary shadow-[inset_0_-2px_0_var(--vocs-color-accent)]"
                : "text-secondary hover:text-primary",
            )}
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
          className="min-h-14 px-3.5 py-3 text-sm leading-[1.45]"
        >
          {user}
        </div>
      )}
      {current === "request" && request && (
        <div
          id={`${baseId}-panel-request`}
          role="tabpanel"
          aria-labelledby={`${baseId}-request`}
          className="min-h-14 px-3.5 py-3"
        >
          <pre className="m-0 font-mono text-xs leading-[1.45] whitespace-pre-wrap wrap-break-word">{formatRpcCall(request)}</pre>
        </div>
      )}
      {current === "response" && response && (
        <div
          id={`${baseId}-panel-response`}
          role="tabpanel"
          aria-labelledby={`${baseId}-response`}
          className="min-h-14"
        >
          <pre
            className={classNames(
              "m-0 max-h-72 overflow-auto px-3.5 py-3 font-mono text-xs leading-[1.45] whitespace-pre",
              { "text-destructive": responseError },
            )}
          >
            {response}
          </pre>
        </div>
      )}
      {current === "hash" && hash && (
        <div
          id={`${baseId}-panel-hash`}
          role="tabpanel"
          aria-labelledby={`${baseId}-hash`}
          className="min-h-14 px-3.5 py-3"
        >
          {hashNote && <p className="mb-2 text-[13px] text-secondary">{hashNote}</p>}
          <code className="block font-mono text-xs break-all whitespace-pre-wrap">{hash}</code>
        </div>
      )}
    </div>
  );
}
