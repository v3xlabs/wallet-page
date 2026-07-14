"use client";

import { DemoShell } from "../wallet/DemoShell";

export function Erc1155Demo() {
  return (
    <DemoShell source="components/demos/erc-1155-demo.tsx">
      <section className="mt-5 first:mt-0">
        <h3 className="mb-2 text-base">ERC-1155</h3>
        <p className="text-sm text-secondary">
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
