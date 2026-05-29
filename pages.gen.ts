// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/addresses'; render: 'static' }
  | { path: '/chains'; render: 'static' }
  | { path: '/connect'; render: 'static' }
  | { path: '/eip-6963'; render: 'static' }
  | { path: '/eip-747'; render: 'static' }
  | { path: '/eip-7702'; render: 'static' }
  | { path: '/erc-1155'; render: 'static' }
  | { path: '/erc-20'; render: 'static' }
  | { path: '/erc-721'; render: 'static' }
  | { path: '/erc20-permit'; render: 'static' }
  | { path: '/eth-send-calls'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/permissions'; render: 'static' }
  | { path: '/personal-signatures'; render: 'static' }
  | { path: '/roadmap'; render: 'static' }
  | { path: '/send-transaction'; render: 'static' }
  | { path: '/siwe'; render: 'static' }
  | { path: '/switch-chain'; render: 'static' }

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>
  }
  interface CreatePagesConfig {
    pages: Page
  }
}
