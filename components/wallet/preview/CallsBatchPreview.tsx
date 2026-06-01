type CallRow = {
  to: string;
  value?: string;
};

type CallsBatchPreviewProps = {
  chainId: string;
  calls: CallRow[];
};

export function CallsBatchPreview({ chainId, calls }: CallsBatchPreviewProps) {
  return (
    <ul className="wallet-preview-batch-list">
      {calls.map((call, i) => (
        <li key={`${call.to}-${i}`}>
          <span className="wallet-preview-batch-index">{i + 1}</span>
          <code>{call.to}</code>
          <span className="wallet-demo-muted">
            chain
            {" "}
            <code>{chainId}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}
