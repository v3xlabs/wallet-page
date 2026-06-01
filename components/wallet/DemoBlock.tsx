"use client";

import type { ReactNode } from "react";

import { DemoFrame } from "./DemoFrame";

/** Inline demo panel on pages with multiple demos (e.g. addresses, signatures). */
export function DemoBlock({ children, source }: { children: ReactNode; source?: string; }) {
  return (
    <DemoFrame variant="inline" source={source}>
      {children}
    </DemoFrame>
  );
}
