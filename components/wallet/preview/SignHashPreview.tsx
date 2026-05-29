type SignHashPreviewProps = {
  hash: string;
};

export function SignHashPreview({ hash }: SignHashPreviewProps) {
  return (
    <>
      <p className="wallet-preview-warning">
        Not human-readable — wallets should warn before signing a raw hash.
      </p>
      <code className="wallet-preview-hash">{hash}</code>
    </>
  );
}
