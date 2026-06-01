"use client";

import type { ReactNode } from "react";

import { DemoFrame } from "./DemoFrame";

/** Standard demo panel with optional wallet connect (bottom-right). */
export function DemoShell({ children }: { children: ReactNode }) {
  return <DemoFrame>{children}</DemoFrame>;
}
