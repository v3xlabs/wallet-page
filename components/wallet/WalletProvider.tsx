"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Address, EIP1193Provider, Hex } from "viem";

import {
  formatError,
  getAccounts,
  getChainId,
  listenEip6963Providers,
  requestAccounts,
  requestEip6963Providers,
  type Eip6963ProviderDetail,
} from "../../lib/ethereum";
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from "../../lib/walletStorage";

export type WalletSession = {
  provider: EIP1193Provider;
  accounts: Address[];
  chainId: Hex;
  label: string;
  uuid: string;
  icon?: string;
  rdns?: string;
};

export type DiscoveryLogEntry = {
  id: string;
  at: string;
  kind: "listen" | "request" | "announce";
  detail?: Eip6963ProviderDetail["info"];
};

type WalletContextValue = {
  session: WalletSession | undefined;
  providers: Eip6963ProviderDetail[];
  discoveryLog: DiscoveryLogEntry[];
  connectError: string | undefined;
  connecting: boolean;
  connectDetail: (detail: Eip6963ProviderDetail) => Promise<void>;
  cancelPendingConnect: () => void;
  disconnect: () => void;
  requestProviders: () => void;
  refreshSession: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function logId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | undefined>();
  const [providers, setProviders] = useState<Eip6963ProviderDetail[]>([]);
  const [discoveryLog, setDiscoveryLog] = useState<DiscoveryLogEntry[]>([]);
  const [connectError, setConnectError] = useState<string | undefined>();
  const [connecting, setConnecting] = useState(false);

  const appendLog = useCallback((entry: Omit<DiscoveryLogEntry, "id" | "at">) => {
    setDiscoveryLog((prev) => [
      {
        id: logId(),
        at: new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ].slice(0, 50));
  }, []);

  const mergeProvider = useCallback(
    (detail: Eip6963ProviderDetail) => {
      setProviders((prev) => {
        if (prev.some((p) => p.info.uuid === detail.info.uuid)) return prev;
        return [...prev, detail];
      });
      appendLog({ kind: "announce", detail: detail.info });
    },
    [appendLog],
  );

  useEffect(() => {
    appendLog({ kind: "listen" });
    void import("../../lib/openlv").then((m) => m.installOpenlv(mergeProvider));
    return listenEip6963Providers(mergeProvider, { requestOnMount: true });
  }, [appendLog, mergeProvider]);

  const connectDetail = useCallback(
    async (detail: Eip6963ProviderDetail) => {
      setConnecting(true);
      setConnectError(undefined);
      try {
        const accounts = await requestAccounts(detail.provider);
        const chainId = await getChainId(detail.provider);
        const next: WalletSession = {
          provider: detail.provider,
          accounts,
          chainId,
          label: detail.info.name,
          uuid: detail.info.uuid,
          icon: detail.info.icon,
          rdns: detail.info.rdns,
        };
        setSession(next);
        saveStoredSession({
          uuid: next.uuid,
          label: next.label,
          icon: next.icon,
          rdns: next.rdns,
          accounts: next.accounts,
          chainId: next.chainId,
        });
      }
      catch (error) {
        setConnectError(formatError(error));
        setSession(undefined);
        clearStoredSession();
      }
      finally {
        setConnecting(false);
      }
    },
    [],
  );

  const tryRestoreSession = useCallback(
    async (list: Eip6963ProviderDetail[]) => {
      const stored = loadStoredSession();
      if (!stored || session) return;
      const detail = list.find((p) => p.info.uuid === stored.uuid);
      if (!detail) return;
      try {
        const accounts = await getAccounts(detail.provider);
        if (accounts.length === 0) return;
        const chainId = await getChainId(detail.provider);
        setSession({
          provider: detail.provider,
          accounts,
          chainId,
          label: stored.label,
          uuid: stored.uuid,
          icon: stored.icon,
          rdns: stored.rdns,
        });
      }
      catch {
        clearStoredSession();
      }
    },
    [session],
  );

  useEffect(() => {
    void tryRestoreSession(providers);
  }, [providers, tryRestoreSession]);

  const cancelPendingConnect = useCallback(() => {
    setConnecting(false);
    void import("../../lib/openlv").then((m) => m.dismissOpenlvModal());
  }, []);

  const disconnect = useCallback(() => {
    setSession(undefined);
    setConnectError(undefined);
    clearStoredSession();
    void import("../../lib/openlv").then((m) => m.dismissOpenlvModal());
  }, []);

  const requestProviders = useCallback(() => {
    appendLog({ kind: "request" });
    requestEip6963Providers();
  }, [appendLog]);

  const refreshSession = useCallback(async () => {
    if (!session) return;
    const accounts = await getAccounts(session.provider);
    const chainId = await getChainId(session.provider);
    const next = { ...session, accounts, chainId };
    setSession(next);
    saveStoredSession({
      uuid: next.uuid,
      label: next.label,
      icon: next.icon,
      rdns: next.rdns,
      accounts: next.accounts,
      chainId: next.chainId,
    });
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      providers,
      discoveryLog,
      connectError,
      connecting,
      connectDetail,
      cancelPendingConnect,
      disconnect,
      requestProviders,
      refreshSession,
    }),
    [
      session,
      providers,
      discoveryLog,
      connectError,
      connecting,
      connectDetail,
      cancelPendingConnect,
      disconnect,
      requestProviders,
      refreshSession,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}

export type { Eip6963ProviderDetail };
