// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/addresses'; render: 'static' }
  | { path: '/approvals'; render: 'static' }
  | { path: '/assets'; render: 'static' }
  | { path: '/batching'; render: 'static' }
  | { path: '/chains'; render: 'static' }
  | { path: '/connect'; render: 'static' }
  | { path: '/delegation'; render: 'static' }
  | { path: '/ens'; render: 'static' }
  | { path: '/erc-1155'; render: 'static' }
  | { path: '/erc-20'; render: 'static' }
  | { path: '/erc-721'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/multicall'; render: 'static' }
  | { path: '/permissions'; render: 'static' }
  | { path: '/roadmap'; render: 'static' }
  | { path: '/signatures'; render: 'static' }
  | { path: '/siwe'; render: 'static' }
  | { path: '/switch-chain'; render: 'static' }
  | { path: '/transactions'; render: 'static' }
  | { path: '/typed-signatures'; render: 'static' }
  | { path: '/weth'; render: 'static' }

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>
  }
  interface CreatePagesConfig {
    pages: Page
  }
}
