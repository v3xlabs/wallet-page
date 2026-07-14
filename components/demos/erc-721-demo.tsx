"use client";

import { DemoShell } from "../wallet/DemoShell";

export function Erc721Demo() {
  return (
    <DemoShell source="components/demos/erc-721-demo.tsx">
      <section className="mt-5 first:mt-0">
        <h3 className="mb-2 text-base">ERC-721</h3>
        <p className="text-sm text-secondary">
          Full NFT demos need a test contract (mint,
          {" "}
          <code>safeTransferFrom</code>
          ). See the
          {" "}
          <a href="/roadmap">roadmap</a>
          {" "}
          — contributions welcome.
        </p>
      </section>
    </DemoShell>
  );
}
