const MOCK_ACCOUNTS = [
  { address: "0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE", label: "Account 1" },
  { address: "0x742d35Cc6634C0532925a3b8D4C9e6A6b5a96B1f", label: "Account 2" },
  { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cB2", label: "Account 3" },
];

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const avatarBg = (addr: string) => {
  const hue = (Number.parseInt(addr.slice(2, 8), 16) % 360).toString();

  return `hsl(${hue}, 48%, 50%)`;
};

const s = {
  root: {
    margin: "1.75rem 0",
    border: "1px solid var(--vocs-border-color-primary)",
    borderRadius: "0.625rem",
    overflow: "hidden",
    fontFamily: "inherit",
    fontSize: "0.82rem",
  } as React.CSSProperties,
  titleBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.45rem 0.9rem",
    borderBottom: "1px solid var(--vocs-border-color-primary)",
    background: "var(--vocs-background-color-surfaceMuted)",
    fontSize: "0.72rem",
    color: "var(--vocs-text-color-secondary)",
  } as React.CSSProperties,
  trafficDot: (color: string): React.CSSProperties => ({
    width: "0.52rem",
    height: "0.52rem",
    borderRadius: "999px",
    background: color,
    display: "inline-block",
    flexShrink: 0,
  }),
  body: {
    display: "flex",
    flexWrap: "wrap" as const,
    minHeight: "11rem",
  } as React.CSSProperties,
  sidebar: {
    width: "11.5rem",
    flexShrink: 0,
    borderRight: "1px solid var(--vocs-border-color-primary)",
    padding: "0.75rem 0.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.35rem",
    background: "var(--vocs-background-color-code-block)",
  } as React.CSSProperties,
  sidebarLabel: {
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "var(--vocs-text-color-secondary)",
    marginBottom: "0.15rem",
    paddingLeft: "0.25rem",
  } as React.CSSProperties,
  accountRow: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.38rem 0.45rem",
    borderRadius: "0.375rem",
    border: `1px solid ${active ? "color-mix(in srgb, var(--vocs-color-accent) 55%, var(--vocs-border-color-primary))" : "var(--vocs-border-color-primary)"}`,
    background: active
      ? "color-mix(in srgb, var(--vocs-color-accent) 13%, transparent)"
      : "transparent",
    cursor: "default",
  }),
  avatar: (addr: string): React.CSSProperties => ({
    width: "1.4rem",
    height: "1.4rem",
    borderRadius: "999px",
    background: avatarBg(addr),
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.6rem",
    fontWeight: 700,
    color: "#fff",
  }),
  accountText: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.05rem",
    overflow: "hidden",
    minWidth: 0,
  } as React.CSSProperties,
  accountLabel: {
    fontWeight: 600,
    fontSize: "0.73rem",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  } as React.CSSProperties,
  accountAddr: {
    fontFamily: "var(--vocs-font-mono)",
    fontSize: "0.68rem",
    color: "var(--vocs-text-color-secondary)",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  main: {
    flex: 1,
    minWidth: 0,
    padding: "0.6rem 0.85rem 0.85rem",
    position: "relative" as const,
    background: "var(--vocs-background-color-code-block)",
  } as React.CSSProperties,
  badge: {
    position: "absolute" as const,
    top: "0.55rem",
    right: "0.75rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.18rem 0.55rem 0.18rem 0.35rem",
    border: "1px solid var(--vocs-border-color-primary)",
    borderRadius: "999px",
    background: "var(--vocs-background-color-surfaceMuted)",
    fontSize: "0.72rem",
    maxWidth: "calc(100% - 1.5rem)",
    overflow: "hidden",
  } as React.CSSProperties,
  badgeIcon: (addr: string): React.CSSProperties => ({
    width: "0.95rem",
    height: "0.95rem",
    borderRadius: "3px",
    background: avatarBg(addr),
    flexShrink: 0,
  }),
  badgeName: {
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  badgeAddr: {
    fontFamily: "var(--vocs-font-mono)",
    color: "var(--vocs-text-color-secondary)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  } as React.CSSProperties,
  rpcLabel: {
    fontSize: "0.68rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    color: "var(--vocs-text-color-secondary)",
    marginBottom: "0.45rem",
    marginTop: "2rem",
  } as React.CSSProperties,
  arrayList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3rem",
    margin: 0,
    padding: 0,
    listStyle: "none",
  } as React.CSSProperties,
  arrayItem: (first: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.32rem 0.5rem",
    borderRadius: "0.3rem",
    border: `1px solid ${first ? "color-mix(in srgb, var(--vocs-color-accent) 50%, var(--vocs-border-color-primary))" : "var(--vocs-border-color-primary)"}`,
    background: first
      ? "color-mix(in srgb, var(--vocs-color-accent) 10%, transparent)"
      : "transparent",
    opacity: first ? 1 : 0.55,
  }),
  indexPill: (first: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.2rem",
    height: "1.2rem",
    borderRadius: "0.25rem",
    background: first
      ? "color-mix(in srgb, var(--vocs-color-accent) 22%, transparent)"
      : "var(--vocs-background-color-surfaceMuted)",
    fontFamily: "var(--vocs-font-mono)",
    fontSize: "0.65rem",
    fontWeight: 700,
    flexShrink: 0,
  }),
  addrCode: {
    fontFamily: "var(--vocs-font-mono)",
    fontSize: "0.72rem",
    wordBreak: "break-all" as const,
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  tag: {
    fontSize: "0.62rem",
    padding: "0.1rem 0.38rem",
    borderRadius: "999px",
    background: "color-mix(in srgb, var(--vocs-color-accent) 22%, transparent)",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  } as React.CSSProperties,
} as const;

export const AccountsDiagram = () => {
  const first = MOCK_ACCOUNTS[0];

  return (
    <div style={s.root}>
      {/* mock title bar */}
      <div style={s.titleBar}>
        <span style={{ display: "flex", gap: "0.28rem", alignItems: "center" }}>
          <span style={s.trafficDot("#f87171")} />
          <span style={s.trafficDot("#fbbf24")} />
          <span style={s.trafficDot("#34d399")} />
        </span>
        <span style={{ marginLeft: "0.4rem" }}>your dapp</span>
      </div>

      <div style={s.body}>
        {/* wallet sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarLabel}>Connected accounts</div>
          {MOCK_ACCOUNTS.map((acct, i) => (
            <div key={acct.address} style={s.accountRow(i === 0)}>
              <span style={s.avatar(acct.address)}>
                {acct.label[acct.label.length - 1]}
              </span>
              <span style={s.accountText}>
                <span style={s.accountLabel}>{acct.label}</span>
                <code style={s.accountAddr}>{short(acct.address)}</code>
              </span>
            </div>
          ))}
        </div>

        {/* dapp main area */}
        <div style={s.main}>
          {/* mocked badge */}
          <div style={s.badge}>
            <span style={s.badgeIcon(first.address)} />
            <span style={s.badgeName}>MetaMask</span>
            <code style={s.badgeAddr}>{short(first.address)}</code>
          </div>

          <div style={s.rpcLabel}>eth_requestAccounts() → string[]</div>

          <ol style={s.arrayList}>
            {MOCK_ACCOUNTS.map((acct, i) => (
              <li key={acct.address} style={s.arrayItem(i === 0)}>
                <span style={s.indexPill(i === 0)}>{i}</span>
                <code style={s.addrCode}>{acct.address}</code>
                {i === 0 && <span style={s.tag}>accounts[0]</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
