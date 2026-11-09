"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { useWallet } from "./WalletProvider";

const ITEM = "flex h-8 w-full cursor-pointer items-center rounded-md px-2 text-left text-control font-medium text-heading transition-colors duration-150 hover:bg-surfaceTint focus-visible:bg-surfaceTint";

export const WalletBadge = () => {
  const { session, disconnect, openConnect } = useWallet();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    menu.current?.scrollIntoView({ block: "nearest" });

    const dismiss = (event: PointerEvent) => {
      if (wrapper.current && !event.composedPath().includes(wrapper.current)) setOpen(false);
    };

    document.addEventListener("pointerdown", dismiss);

    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  if (!session) return null;

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) return;

    if (event.key === "Escape") {
      event.stopPropagation();
      close();

      return;
    }

    if (event.key === "Tab") {
      close();

      return;
    }

    const list = [...menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? []];
    const index = list.findIndex(item => item.matches(":focus"));
    const target = {
      ArrowDown: list[(index + 1) % list.length],
      ArrowUp: list[(index - 1 + list.length) % list.length],
      Home: list[0],
      End: list.at(-1),
    }[event.key];

    if (!target) return;

    event.preventDefault();
    target.focus();
  };

  const choose = (action: () => void) => {
    trigger.current?.focus();
    setOpen(false);
    action();
  };

  return (
    <div ref={wrapper} className="relative min-w-0" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(previous => !previous)}
        className="relative flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-control transition-colors duration-150 after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] hover:bg-surfaceTint"
      >
        {session.icon && (
          <img
            src={session.icon}
            alt=""
            className="shrink-0 rounded-sm"
            width={16}
            height={16}
          />
        )}
        <span className="truncate font-medium text-heading" title={session.rdns}>
          {session.label}
        </span>
        <span className="font-mono text-xs whitespace-nowrap text-secondary" title={session.accounts[0]}>
          {`${session.accounts[0].slice(0, 6)}...${session.accounts[0].slice(-4)}`}
        </span>
        <FiChevronDown aria-hidden className="size-3.5 shrink-0 text-secondary" />
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label="Wallet"
          className="demo-menu absolute top-full left-0 z-10 mt-1 w-40 rounded-xl border border-primary bg-surface p-1 text-primary shadow-overlay"
        >
          <button type="button" role="menuitem" tabIndex={-1} className={ITEM} onClick={() => choose(openConnect)}>
            Change wallet
          </button>
          <button type="button" role="menuitem" tabIndex={-1} className={ITEM} onClick={() => choose(disconnect)}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
