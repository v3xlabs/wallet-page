import type { Address, Hex } from "viem";

const STORAGE_KEY = "wallet-capabilities:session";

export type StoredWalletSession = {
  uuid: string;
  label: string;
  icon?: string;
  rdns?: string;
  accounts: Address[];
  chainId: Hex;
};

export function loadStoredSession(): StoredWalletSession | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as StoredWalletSession;
  }
  catch {
    return undefined;
  }
}

export function saveStoredSession(session: StoredWalletSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}
