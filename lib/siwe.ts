export type SiweMessageFields = {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: string;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
};

export function buildSiweMessage(
  address: string,
  chainId: number,
  nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16),
) {
  const domain = typeof window !== "undefined" ? window.location.host : "wallet.page";
  const uri = typeof window !== "undefined" ? window.location.origin : "https://wallet.page";
  const issuedAt = new Date().toISOString();
  return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to wallet.page demos.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

/** Lightweight EIP-4361 parser for demo previews (not a full validator). */
export function parseSiweMessage(message: string): SiweMessageFields | null {
  const lines = message.split("\n");
  const header = lines[0];
  const headerMatch = /^(.+) wants you to sign in with your Ethereum account:$/.exec(
    header,
  );
  if (!headerMatch) return null;

  const address = lines[1]?.trim();
  if (!address?.startsWith("0x")) return null;

  const blankIdx = lines.indexOf("", 2);
  if (blankIdx === -1) return null;

  const statementLines: string[] = [];
  let i = blankIdx + 1;
  while (i < lines.length && !lines[i].includes(": ")) {
    statementLines.push(lines[i]);
    i += 1;
  }
  const statement = statementLines.join("\n").trim();

  const fields: Record<string, string> = {};
  for (; i < lines.length; i += 1) {
    const line = lines[i];
    const sep = line.indexOf(": ");
    if (sep === -1) continue;
    fields[line.slice(0, sep)] = line.slice(sep + 2);
  }

  if (!fields.URI || !fields["Chain ID"] || !fields.Nonce || !fields["Issued At"]) {
    return null;
  }

  return {
    domain: headerMatch[1],
    address,
    statement,
    uri: fields.URI,
    version: fields.Version ?? "1",
    chainId: fields["Chain ID"],
    nonce: fields.Nonce,
    issuedAt: fields["Issued At"],
    expirationTime: fields["Expiration Time"],
    notBefore: fields["Not Before"],
    requestId: fields["Request ID"],
    resources: fields.Resources
      ? fields.Resources.split(",").map((r) => r.trim())
      : undefined,
  };
}
