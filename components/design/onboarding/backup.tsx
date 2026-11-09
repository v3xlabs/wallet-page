"use client";

import classNames from "classnames";
import { useState } from "react";

import { PrimaryButton } from "../ui";
import { WORDS } from "./shared";

/**
 * Backup step: the phrase stays blurred until the user actively holds a
 * button - secrets get ceremony, never a casual glance.
 */
export const BackupScreen = ({ onContinue }: { onContinue: () => void; }) => {
  const [revealed, setRevealed] = useState(false);
  const [everRevealed, setEverRevealed] = useState(false);

  const show = () => {
    setRevealed(true);
    setEverRevealed(true);
  };

  const hide = () => setRevealed(false);

  return (
    <div className="flex grow flex-col gap-3 px-4 pt-2 pb-4">
      <p className="rounded-xl bg-warning-tint px-3 py-2.5 text-xs leading-relaxed text-warning">
        Anyone with these words controls the wallet. Write them down on paper - no screenshots.
      </p>
      <div
        aria-hidden={!revealed}
        className={classNames(
          "grid grid-cols-3 gap-1.5 transition-[filter] duration-150",
          !revealed && "blur-sm select-none",
        )}
      >
        {WORDS.map((word, index) => (
          <span
            key={index}
            className="flex h-8 items-center gap-1.5 rounded-md border border-primary bg-surfaceMuted px-2"
          >
            <span className="w-3.5 shrink-0 text-right text-[10px] text-muted tabular-nums">
              {index + 1}
            </span>
            <span className="font-mono text-control text-heading">{word}</span>
          </span>
        ))}
      </div>
      <button
        type="button"
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          event.preventDefault();

          if (revealed) {
            hide();
          }
          else {
            show();
          }
        }}
        className="w-full cursor-pointer rounded-xl border border-primary bg-surfaceMuted px-4 py-3 text-sm font-semibold text-primary transition-[background-color,transform] duration-150 select-none hover:bg-surfaceTint active:scale-[0.985]"
      >
        {revealed ? "Release to hide" : "Hold to reveal"}
      </button>
      <p className="text-center text-[11px] text-muted">
        This is the standard demo phrase - never reuse it for real funds.
      </p>
      <div className="mt-auto pt-2">
        <PrimaryButton onClick={onContinue} disabled={!everRevealed}>
          I wrote them down
        </PrimaryButton>
      </div>
    </div>
  );
};
