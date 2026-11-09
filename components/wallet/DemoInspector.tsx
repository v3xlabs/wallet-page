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

export const DemoInspector = ({
  user,
  request,
  response,
  hash,
  hashNote,
  responseError,
}: DemoInspectorProps) => {
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
  const [shownResponse, setShownResponse] = useState(response);

  // A new response is the result of the reader's click, so it takes focus.
  if (response !== shownResponse) {
    setShownResponse(response);

    if (response) setActive("response");
  }

  // `active` is the user's explicit choice; fall back to the first available tab
  // whenever that choice is no longer valid (tabs are derived from props).
  const current = tabs.some(t => t.id === active) ? active : tabs[0]?.id;

  if (tabs.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="flex gap-5 overflow-x-auto overflow-y-hidden border-b border-primary" role="tablist" aria-label="Demo views">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={current === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            className="demo-tab"
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
          className="pt-3 text-sm leading-5 text-primary"
        >
          {user}
        </div>
      )}
      {current === "request" && request && (
        <div
          id={`${baseId}-panel-request`}
          role="tabpanel"
          aria-labelledby={`${baseId}-request`}
          className="pt-3"
        >
          <pre tabIndex={0} className="demo-scroll-x m-0 pb-1 font-mono text-control whitespace-pre">{formatRpcCall(request)}</pre>
        </div>
      )}
      {current === "response" && response && (
        <div
          id={`${baseId}-panel-response`}
          role="tabpanel"
          aria-labelledby={`${baseId}-response`}
        >
          <pre
            tabIndex={0}
            className={classNames(
              "m-0 max-h-72 overflow-y-auto pt-3 pb-1 font-mono text-control",
              response.includes("\n") ? "demo-scroll-x whitespace-pre" : "break-all whitespace-pre-wrap",
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
          className="flex flex-col gap-2 pt-3"
        >
          {hashNote && <p className="m-0 text-control text-secondary">{hashNote}</p>}
          <code className="block font-mono text-control break-all whitespace-pre-wrap">{hash}</code>
        </div>
      )}
    </div>
  );
};
