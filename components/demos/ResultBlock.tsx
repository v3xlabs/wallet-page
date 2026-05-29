"use client";

export function ResultBlock({
  label,
  value,
  error,
  pending,
}: {
  label: string;
  value?: string;
  error?: string;
  pending?: boolean;
}) {
  if (!pending && !value && !error) return null;

  return (
    <div
      className={`wallet-demo-result${error ? " wallet-demo-result-error" : ""}${value && !error ? " wallet-demo-result-ok" : ""}`}
    >
      <div className="wallet-demo-result-label">{label}</div>
      {pending && <p className="wallet-demo-muted">Waiting for wallet…</p>}
      {error && <pre>{error}</pre>}
      {value && <pre>{value}</pre>}
    </div>
  );
}
