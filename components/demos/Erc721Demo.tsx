"use client";

import { DemoShell } from "../wallet/DemoShell";

export function Erc721Demo() {
  return (
    <DemoShell>
      <section className="wallet-demo-section">
        <h3>ERC-721</h3>
        <p className="wallet-demo-muted">
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
