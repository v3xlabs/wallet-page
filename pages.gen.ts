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
  | { path: '/connect'; render: 'static' }
  | { path: '/delegation'; render: 'static' }
  | { path: '/design/address'; render: 'static' }
  | { path: '/design/amounts/implementation'; render: 'static' }
  | { path: '/design/amounts'; render: 'static' }
  | { path: '/design/assets'; render: 'static' }
  | { path: '/design/connect'; render: 'static' }
  | { path: '/design/history'; render: 'static' }
  | { path: '/design/importing'; render: 'static' }
  | { path: '/design'; render: 'static' }
  | { path: '/design/mnemonics'; render: 'static' }
  | { path: '/design/networks'; render: 'static' }
  | { path: '/design/onboarding'; render: 'static' }
  | { path: '/design/prices'; render: 'static' }
  | { path: '/design/receive'; render: 'static' }
  | { path: '/design/recovery'; render: 'static' }
  | { path: '/design/send'; render: 'static' }
  | { path: '/design/signing'; render: 'static' }
  | { path: '/design/swap'; render: 'static' }
  | { path: '/ens'; render: 'static' }
  | { path: '/erc-1155'; render: 'static' }
  | { path: '/erc-20'; render: 'static' }
  | { path: '/erc-721'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/multicall'; render: 'static' }
  | { path: '/networks'; render: 'static' }
  | { path: '/permissions'; render: 'static' }
  | { path: '/roadmap'; render: 'static' }
  | { path: '/signatures'; render: 'static' }
  | { path: '/siwe'; render: 'static' }
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
