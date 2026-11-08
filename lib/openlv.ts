import { OPENLV_ICON_128_WHITE } from "@openlv/core/icons";
import { createProvider, type OpenLVProvider, ProviderStatus } from "@openlv/provider";
import type { EIP1193Parameters, EIP1193Provider } from "viem";

import type { Eip6963ProviderDetail } from "./ethereum";

/** Stable id for session restore -- not an EIP-6963 wallet extension. */
export const OPENLV_UUID = "a8c4e1f2-6b3d-4f9e-openlv-wallet-page";

export const OPENLV_RDNS = "company.v3x.openlv";

const OPENLV_INFO = {
  uuid: OPENLV_UUID,
  name: "openlv",
  icon: OPENLV_ICON_128_WHITE,
  rdns: OPENLV_RDNS,
} as const;

let openlvDetail: Eip6963ProviderDetail | undefined;

/** Remove stray OpenLV overlays that block clicks on the wallet picker. */
export const dismissOpenlvModal = () => {
  if (typeof document === "undefined") return;

  for (const element of document.querySelectorAll("openlv-modal")) {
    if (element instanceof HTMLElement && "hideModal" in element) {
      (element as HTMLElement & { hideModal: () => void; }).hideModal();
    }

    element.remove();
  }
};

const openOpenlvModal = async (provider: OpenLVProvider) => {
  dismissOpenlvModal();

  const { registerOpenLVModal, triggerOpenModal } = await import("@openlv/modal");

  registerOpenLVModal();

  if (provider.status.get() === ProviderStatus.CONNECTED) return;

  await new Promise<void>((resolve, reject) => {
    const unsubscribe = provider.status.subscribe((status) => {
      if (status !== ProviderStatus.CONNECTED) return;

      unsubscribe();
      dismissOpenlvModal();
      resolve();
    });

    triggerOpenModal({
      provider,
      theme: {
        theme: "openlv",
        mode: document.documentElement.dataset.vocsTheme === "dark" ? "dark" : "light",
      },
      onClose: async () => {
        unsubscribe();
        dismissOpenlvModal();

        if (provider.status.get() !== ProviderStatus.CONNECTED) {
          try {
            await provider.closeSession();
            reject(new Error("Connection cancelled"));
          }
          catch (error) {
            reject(error);
          }

          return;
        }

        resolve();
      },
    });

    requestAnimationFrame(() => {
      const element = document.querySelector("openlv-modal");

      if (element instanceof HTMLElement && "showModal" in element) {
        (element as HTMLElement & { showModal: () => void; }).showModal();
      }
    });
  });
};

const createOpenlvDetail = (): Eip6963ProviderDetail => {
  const provider = createProvider({});

  return {
    info: { ...OPENLV_INFO },
    provider: {
      ...provider,
      request: async (request: EIP1193Parameters) => {
        if (request.method === "eth_requestAccounts") {
          await openOpenlvModal(provider);

          return provider.getAccounts();
        }

        return provider.request(request);
      },
    } as unknown as EIP1193Provider,
  };
};

/**
 * Register [openlv](https://openlv.sh) alongside EIP-6963 discoveries.
 * Call once on the client (e.g. `installOpenlv(mergeProvider)`).
 */
export const installOpenlv = (
  announce: (detail: Eip6963ProviderDetail) => void,
): void => {
  if (globalThis.window === undefined) return;

  if (!openlvDetail) openlvDetail = createOpenlvDetail();

  announce(openlvDetail);
};

export const getOpenlvConnector = (): Eip6963ProviderDetail | undefined => openlvDetail;

export const closeOpenlvSession = () =>
  openlvDetail?.provider.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });

export const isOpenlvProvider = (detail: Eip6963ProviderDetail) => detail.info.rdns === OPENLV_RDNS;
