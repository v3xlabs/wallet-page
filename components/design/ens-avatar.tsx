"use client";

import classNames from "classnames";
import type { FC } from "react";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { normalize } from "viem/ens";

import { mainnetClient } from "./client";
import { AddressAvatar } from "./ui";

/**
 * Avatar lookups are decoration: cached per session, shared across every
 * demo, and silently absent when a name has none.
 */
const avatarCache = new Map<string, Promise<string | null>>();
const primaryNameCache = new Map<string, Promise<string | null>>();

const avatarFor = (name: string) => {
  let pending = avatarCache.get(name);

  if (!pending) {
    pending = mainnetClient
      .getEnsAvatar({ name: normalize(name) })
      .catch(() => null);
    avatarCache.set(name, pending);
  }

  return pending;
};

const primaryNameFor = (address: string) => {
  const key = address.toLowerCase();
  let pending = primaryNameCache.get(key);

  if (!pending) {
    pending = mainnetClient
      .getEnsName({ address: address as Address })
      .catch(() => null);
    primaryNameCache.set(key, pending);
  }

  return pending;
};

const EnsAvatarInner: FC<{ address: string; name?: string; size: number; }> = ({
  address,
  name,
  size,
}) => {
  const [src, setSrc] = useState<string>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // No name given? Fall back to the address's primary name.
      const ensName = name ?? await primaryNameFor(address);

      if (!ensName || cancelled) return;

      const avatar = await avatarFor(ensName);

      if (!cancelled && avatar) setSrc(avatar);
    })();

    return () => {
      cancelled = true;
    };
  }, [address, name]);

  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <AddressAvatar address={address} size={size} />
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden
          onLoad={() => setLoaded(true)}
          onError={() => setSrc(undefined)}
          className={classNames(
            "absolute inset-0 size-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </span>
  );
};

/**
 * Identity circle: the deterministic gradient immediately, the ENS avatar
 * layered on top once it resolves. Pass `name` when the ENS name is already
 * known; otherwise the address's primary name is looked up.
 */
export const EnsAvatar: FC<{ address: string; name?: string; size?: number; }> = ({
  address,
  name,
  size = 32,
}) => (
  // Keyed so switching identity resets to the gradient instead of showing
  // the previous identity's face.
  <EnsAvatarInner
    key={`${address.toLowerCase()}|${name ?? ""}`}
    address={address}
    name={name}
    size={size}
  />
);
