"use client";

import type { ReactNode } from "react";

import { DemoFrame } from "./DemoFrame";

/** Inline demo panel on pages with multiple demos (e.g. addresses, signatures). */
export const DemoBlock = ({ children, source }: { children: ReactNode; source?: string; }) => (
  <DemoFrame variant="inline" source={source}>
    {children}
  </DemoFrame>
);
