"use client";

import classNames from "classnames";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type SelectOption<Value extends string> = {
  value: Value;
  label: string;
  detail?: string;
};

const TYPEAHEAD_RESET_MS = 500;
const PAGE_STEP = 10;
const VIEWPORT_GAP_PX = 8;
const LIST_OFFSET_PX = 4;
const LIST_MAX_HEIGHT_PX = 320;

export const Select = <Value extends string>({ value, options, onChange, display, className, id, label }: {
  value: Value;
  options: readonly SelectOption<Value>[];
  onChange: (value: Value) => void;
  display?: ReactNode;
  className?: string;
  id?: string;
  label: string;
}) => {
  const listId = useId();
  const triggerReference = useRef<HTMLButtonElement>(null);
  const listReference = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timeout: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex(option => option.value === value);
  const selected = options[selectedIndex];

  const open = (index: number) => {
    setActiveIndex(Math.max(0, index));
    setIsOpen(true);
    // Safari does not focus buttons on click.
    triggerReference.current?.focus({ preventScroll: true });
  };

  const commit = (index: number) => {
    const option = options[index];

    setIsOpen(false);

    if (option && option.value !== value) onChange(option.value);
  };

  const findByTypeahead = (key: string) => {
    const state = typeahead.current;

    globalThis.clearTimeout(state.timeout);
    state.text += key.toLowerCase();
    state.timeout = globalThis.setTimeout(() => {
      state.text = "";
    }, TYPEAHEAD_RESET_MS);

    const from = isOpen ? activeIndex : selectedIndex;
    const isRepeat = [...state.text].every(char => char === state.text[0]);
    const query = isRepeat ? state.text[0] : state.text;
    const start = isRepeat || state.text.length === 1 ? from + 1 : from;
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    const match = ordered.find(option => option.label.toLowerCase().startsWith(query));

    return match ? options.indexOf(match) : -1;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (isPrintable && !(event.key === " " && typeahead.current.text === "")) {
      event.preventDefault();
      const index = findByTypeahead(event.key);

      if (index === -1) return;

      if (isOpen) setActiveIndex(index);
      else open(index);

      return;
    }

    if (!isOpen) {
      const opening: Record<string, number> = {
        "ArrowDown": selectedIndex,
        "ArrowUp": selectedIndex,
        "Enter": selectedIndex,
        " ": selectedIndex,
        "Home": 0,
        "End": last,
      };
      const index = opening[event.key];

      if (index === undefined) return;

      event.preventDefault();
      open(index);

      return;
    }

    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, activeIndex + 1),
      ArrowUp: Math.max(0, activeIndex - 1),
      Home: 0,
      End: last,
      PageDown: Math.min(last, activeIndex + PAGE_STEP),
      PageUp: Math.max(0, activeIndex - PAGE_STEP),
    };
    const move = moves[event.key];

    if (move !== undefined && !(event.key === "ArrowUp" && event.altKey)) {
      event.preventDefault();
      setActiveIndex(move);

      return;
    }

    if (event.key === "Enter" || event.key === " " || (event.key === "ArrowUp" && event.altKey)) {
      event.preventDefault();
      commit(activeIndex);

      return;
    }

    if (event.key === "Tab") {
      commit(activeIndex);

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  useLayoutEffect(() => {
    const trigger = triggerReference.current;
    const list = listReference.current;

    if (!isOpen || !trigger || !list) return;

    const anchor = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const below = globalThis.innerHeight - anchor.bottom - LIST_OFFSET_PX - VIEWPORT_GAP_PX;
    const above = anchor.top - LIST_OFFSET_PX - VIEWPORT_GAP_PX;

    list.showPopover();
    list.style.minWidth = `${anchor.width}px`;
    list.style.maxWidth = `${viewportWidth - 2 * VIEWPORT_GAP_PX}px`;

    const isBelow = Math.min(list.scrollHeight + 2, LIST_MAX_HEIGHT_PX) <= below || below >= above;

    list.style.maxHeight = `${Math.min(LIST_MAX_HEIGHT_PX, isBelow ? below : above)}px`;
    list.style.top = isBelow
      ? `${anchor.bottom + LIST_OFFSET_PX}px`
      : `${anchor.top - LIST_OFFSET_PX - list.offsetHeight}px`;

    const width = list.offsetWidth;
    const left = anchor.left + width > viewportWidth - VIEWPORT_GAP_PX
      ? anchor.right - width
      : anchor.left;

    list.style.left = `${Math.max(VIEWPORT_GAP_PX, left)}px`;

    const close = (event: Event) => {
      if (event.target !== list) setIsOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();

      if (!path.includes(trigger) && !path.includes(list)) setIsOpen(false);
    };

    globalThis.addEventListener("resize", close);
    globalThis.addEventListener("scroll", close, { capture: true, passive: true });
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      globalThis.removeEventListener("resize", close);
      globalThis.removeEventListener("scroll", close, { capture: true });
      document.removeEventListener("pointerdown", onPointerDown);

      if (list.matches(":popover-open")) list.hidePopover();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    listReference.current?.children.item(activeIndex)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  useEffect(() => () => globalThis.clearTimeout(typeahead.current.timeout), []);

  return (
    <>
      <button
        ref={triggerReference}
        type="button"
        id={id}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : open(selectedIndex))}
        onKeyDown={onKeyDown}
        onKeyUp={(event) => {
          // Firefox activates buttons on Space keyup even after keydown handled it.
          if (event.key === " ") event.preventDefault();
        }}
        onBlur={() => setIsOpen(false)}
        className={classNames("flex cursor-pointer items-center gap-1.5 text-start", className)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          {display ?? (selected && (
            <>
              <span className="truncate">{selected.label}</span>
              {selected.detail && <bdi dir="auto" className="truncate text-muted">{selected.detail}</bdi>}
            </>
          ))}
        </span>
        <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0 text-muted">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul
        ref={listReference}
        id={listId}
        role="listbox"
        aria-label={label}
        popover="manual"
        tabIndex={-1}
        onMouseDown={event => event.preventDefault()}
        onClick={event => event.preventDefault()}
        className="m-0 inset-auto grid-cols-[auto_minmax(0,1fr)_auto] overflow-y-auto overscroll-contain rounded-lg border border-primary bg-surface p-1 text-sm text-primary shadow-overlay [&:popover-open]:grid"
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
            onPointerMove={() => setActiveIndex(index)}
            onClick={() => commit(index)}
            className={classNames(
              "col-span-full grid h-8 cursor-pointer grid-cols-subgrid items-center gap-x-3 rounded-md px-2 whitespace-nowrap",
              index === activeIndex && "bg-surfaceTint",
              index === selectedIndex && "font-medium text-heading",
            )}
          >
            <span className="truncate">{option.label}</span>
            <bdi dir="auto" className="max-w-full justify-self-start truncate text-muted">{option.detail}</bdi>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              className={classNames("size-3.5 text-accent", index !== selectedIndex && "invisible")}
            >
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </li>
        ))}
      </ul>
    </>
  );
};
