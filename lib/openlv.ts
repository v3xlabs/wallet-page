import { OPENLV_ICON_128_WHITE } from "@openlv/core/icons";
import { createProvider, type OpenLVProvider } from "@openlv/provider";
import type { EIP1193Provider } from "viem";

import type { Eip6963ProviderDetail } from "./ethereum";

/** Stable id for session restore — not an EIP-6963 wallet extension. */
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
export function dismissOpenlvModal() {
  if (typeof document === "undefined") return;
  for (const el of document.querySelectorAll("openlv-modal")) {
    if (el instanceof HTMLElement && "hideModal" in el) {
      (el as HTMLElement & { hideModal: () => void }).hideModal();
    }
    el.remove();
  }
}

async function openOpenlvModal(provider: OpenLVProvider) {
  dismissOpenlvModal();

  const { registerOpenLVModal, triggerOpenModal } = await import("@openlv/modal");
  registerOpenLVModal();

  await new Promise<void>((resolve, reject) => {
    triggerOpenModal({
      provider,
      onClose: () => {
        dismissOpenlvModal();
        if (provider.getSession() === undefined) {
          void provider.closeSession().catch(() => {});
          reject(new Error("Connection cancelled"));
          return;
        }
        resolve();
      },
    });

    requestAnimationFrame(() => {
      const el = document.querySelector("openlv-modal");
      if (el instanceof HTMLElement && "showModal" in el) {
        (el as HTMLElement & { showModal: () => void }).showModal();
      }
    });
  });
}

function createOpenlvDetail(): Eip6963ProviderDetail {
  const provider = createProvider({
    config: {
      signaling: {
        p: "mqtt",
        s: {
          mqtt: "wss://test.mosquitto.org:8081/mqtt",
        },
      },
      transport: { p: "webrtc" },
    },
    openModal: openOpenlvModal,
  });

  return {
    info: { ...OPENLV_INFO },
    provider: provider as unknown as EIP1193Provider,
  };
}

/**
 * Register [openlv](https://openlv.sh) alongside EIP-6963 discoveries.
 * Call once on the client (e.g. `installOpenlv(mergeProvider)`).
 */
export function installOpenlv(
  announce: (detail: Eip6963ProviderDetail) => void,
): void {
  if (typeof window === "undefined") return;
  if (!openlvDetail) openlvDetail = createOpenlvDetail();
  announce(openlvDetail);
}

export function getOpenlvConnector(): Eip6963ProviderDetail | undefined {
  return openlvDetail;
}

export function isOpenlvProvider(detail: Eip6963ProviderDetail) {
  return detail.info.rdns === OPENLV_RDNS;
}
