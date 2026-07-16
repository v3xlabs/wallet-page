"use client";

import type { ReactNode } from "react";

import { DemoFrame } from "./DemoFrame";

/** Standard demo panel with optional wallet connect (bottom-right). */
export const DemoShell = ({ children, source }: { children: ReactNode; source?: string; }) =>
  <DemoFrame source={source}>{children}</DemoFrame>;
