import { shortAddress } from "../../../lib/display";
import { parseSiweMessage } from "../../../lib/siwe";

type SiwePreviewProps = {
  message: string;
};

export function SiwePreview({ message }: SiwePreviewProps) {
  const parsed = message ? parseSiweMessage(message) : null;

  if (!parsed?.address || !parsed.domain) {
    return <pre className="wallet-preview-raw">{message}</pre>;
  }

  return (
    <>
      <p className="wallet-preview-siwe-lead">
        <strong>{parsed.domain}</strong>
        {" "}
        · sign in as
        {" "}
        <code>{shortAddress(parsed.address, 6)}</code>
      </p>
      {parsed.statement && (
        <p className="wallet-preview-siwe-statement">{parsed.statement}</p>
      )}
      <dl className="wallet-preview-meta">
        <div>
          <dt>URI</dt>
          <dd>{parsed.uri}</dd>
        </div>
        <div>
          <dt>Chain</dt>
          <dd>{parsed.chainId}</dd>
        </div>
        <div>
          <dt>Nonce</dt>
          <dd>
            <code>{parsed.nonce}</code>
          </dd>
        </div>
      </dl>
    </>
  );
}
