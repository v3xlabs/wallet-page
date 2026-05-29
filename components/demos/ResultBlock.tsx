"use client";

export function ResultBlock({
  label,
  value,
  error,
}: {
  label: string;
  value?: string;
  error?: string;
}) {
  if (!value && !error) return null;

  return (
    <div
      className={`wallet-demo-result${error ? " wallet-demo-result-error" : ""}${value && !error ? " wallet-demo-result-ok" : ""}`}
    >
      <div className="wallet-demo-result-label">{label}</div>
      {error && <pre>{error}</pre>}
      {value && <pre>{value}</pre>}
    </div>
  );
}
