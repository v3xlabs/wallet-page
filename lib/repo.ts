const REPO_BLOB_BASE
  = "https://github.com/v3xlabs/wallet-page/blob/master";

/** Build a link to a repo-relative source file on GitHub. */
export const sourceUrl = (path: string): string =>
  `${REPO_BLOB_BASE}/${path.replace(/^\/+/, "")}`;
