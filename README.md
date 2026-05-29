# wallet.page

Interactive documentation site for [wallet.page](https://wallet.page), built with [Vocs](https://vocs.dev) **2.0.4**. Each page explains a wallet feature or EIP and includes a live demo to test your browser extension.

Inspired by the [MetaMask test dapp](https://metamask.github.io/test-dapp/).

## Commands

```bash
pnpm install
pnpm dev         # local dev server
pnpm build       # static export → dist/public/
pnpm preview
```

Uses [pnpm](https://pnpm.io/) only (`auto-install-peers=false` in `.npmrc`).

[openlv](https://openlv.sh) is registered as a default connector via `@openlv/provider` — see `lib/openlv.ts` and `installOpenlv()` in `WalletProvider`.

## Project layout

| Path | Purpose |
| --- | --- |
| `pages/*.mdx` | Docs + `<*Demo />` embeds |
| `pages/_layout.tsx` | Global `WalletProvider` (shared session) |
| `components/demos/` | Interactive React demos (`"use client"`) |
| `components/wallet/` | Shared connect UI, EIP-6963 discovery, modal |
| `lib/ethereum.ts` | EIP-1193 helpers |
| `vocs.config.ts` | Sidebar, static `renderStrategy` |

Demos use **React** (not Solid) so they hydrate reliably under Vocs 2’s RSC/Waku pipeline.

## Adding a page

1. Add `components/demos/MyDemo.tsx` with `"use client"` and wrap content in `<DemoShell>`.
2. Add `pages/my-topic.mdx` importing the demo and register in `vocs.config.ts`.
