"use client";

import classNames from "classnames";
import { useState } from "react";

import { PrimaryButton } from "../ui";
import { WORDS } from "./shared";

/**
 * Two spot-checks with fixed-order choices. Distractors come from the same
 * BIP-39 wordlist; the order is a fixed permutation so prerendered HTML and
 * hydration always agree.
 */
const CHALLENGES: { wordNumber: number; choices: string[]; }[] = [
  { wordNumber: 3, choices: ["canyon", WORDS[2], "ribbon", "orbit"] },
  { wordNumber: 9, choices: ["spirit", "lumber", WORDS[8], "velvet"] },
];

const ChoiceRow = ({ wordNumber, choices, solved, onSolved }: {
  wordNumber: number;
  choices: string[];
  solved: boolean;
  onSolved: () => void;
}) => {
  const [wrong, setWrong] = useState<string>();

  const pick = (choice: string) => {
    if (solved || wrong !== undefined) return;

    if (choice === WORDS[wordNumber - 1]) {
      onSolved();

      return;
    }

    // Wrong pick: flash destructive, shake, then reset the row.
    setWrong(choice);
    setTimeout(() => setWrong(undefined), 500);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-secondary uppercase">
        Word #
        {wordNumber}
      </span>
      <div
        className="grid grid-cols-4 gap-1.5"
        style={wrong === undefined ? undefined : { animation: "design-verify-shake 0.3s ease" }}
      >
        {choices.map(choice => (
          <button
            key={choice}
            type="button"
            onClick={() => pick(choice)}
            className={classNames(
              "cursor-pointer rounded-lg border px-1 py-1.5 font-mono text-[13px] transition-colors",
              solved && choice === WORDS[wordNumber - 1]
                ? "border-primary bg-success-tint text-success"
                : (wrong === choice
                    ? "border-primary bg-destructive-tint text-destructive"
                    : "border-primary bg-surfaceMuted text-primary hover:bg-surfaceTint"),
            )}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

export const VerifyScreen = ({ onDone }: { onDone: () => void; }) => {
  const [solvedRows, setSolvedRows] = useState<number[]>([]);
  const allSolved = solvedRows.length === CHALLENGES.length;

  return (
    <div className="flex grow flex-col gap-4 px-4 pt-2 pb-4">
      <p className="text-[13px] leading-relaxed text-secondary">
        Pick the right words from your backup - this catches a bad copy now, not at recovery time.
      </p>
      {CHALLENGES.map(challenge => (
        <ChoiceRow
          key={challenge.wordNumber}
          wordNumber={challenge.wordNumber}
          choices={challenge.choices}
          solved={solvedRows.includes(challenge.wordNumber)}
          onSolved={() => setSolvedRows(rows => [...rows, challenge.wordNumber])}
        />
      ))}
      <div className="mt-auto">
        <PrimaryButton onClick={onDone} disabled={!allSolved}>
          {allSolved ? "Continue" : "Match both words to continue"}
        </PrimaryButton>
      </div>
      <style>
        {"@keyframes design-verify-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }"}
      </style>
    </div>
  );
};
