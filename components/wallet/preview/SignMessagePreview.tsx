type SignMessagePreviewProps = {
  message: string;
};

export function SignMessagePreview({ message }: SignMessagePreviewProps) {
  return <p className="wallet-preview-message">{message}</p>;
}
