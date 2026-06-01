"use client";

import { DemoShell } from "../wallet/DemoShell";

export function Erc1155Demo() {
  return (
    <DemoShell source="components/demos/erc-1155-demo.tsx">
      <section className="wallet-demo-section">
        <h3>ERC-1155</h3>
        <p className="wallet-demo-muted">
          Batch
          {" "}
          <code>safeBatchTransferFrom</code>
          {" "}
          tests need a deployed
          ERC-1155 on your chain — planned on the roadmap.
        </p>
      </section>
    </DemoShell>
  );
}
