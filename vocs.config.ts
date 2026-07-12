import { defineConfig } from "vocs/config";

export default defineConfig({
  title: "wallet.page",
  titleTemplate: "%s · wallet.page",
  description:
    "Interactive docs at wallet.page — test whether your browser wallet supports common EIPs and RPC methods.",
  rootDir: ".",
  srcDir: ".",
  renderStrategy: "full-static",
  mcp: { enabled: false },
  accentColor: "#6c5ce7",
  basePath: "/",
  iconUrl: {
    light: "/icon_light.webp",
    dark: "/icon_dark.webp",
  },
  sidebar: [
    { text: "Introduction", link: "/" },
    { text: "Roadmap", link: "/roadmap" },
    {
      text: "Wallet specifications",
      items: [
        { text: "Connect", link: "/connect" },
        {
          text: "Account",
          items: [
            { text: "Addresses", link: "/addresses" },
            { text: "Permissions", link: "/permissions" },
            { text: "Chains", link: "/chains" },
          ],
        },
        {
          text: "Signing",
          items: [
            { text: "Personal signatures", link: "/signatures" },
            { text: "Sign-In with Ethereum", link: "/siwe" },
            { text: "Typed data", link: "/typed-signatures" },
          ],
        },
        {
          text: "Token",
          items: [
            { text: "Approvals", link: "/approvals" },
            { text: "Discovery", link: "/assets" },
          ],
        },
        {
          text: "Transactions",
          items: [
            { text: "Send transaction", link: "/transactions" },
            { text: "Batch calls", link: "/batching" },
            { text: "EIP-7702", link: "/delegation" },
          ],
        },
      ],
    },
    {
      text: "Contracts",
      items: [
        { text: "ERC-20", link: "/erc-20" },
        { text: "ERC-721", link: "/erc-721" },
        { text: "ERC-1155", link: "/erc-1155" },
        { text: "Multicall", link: "/multicall" },
      ],
    },
    {
      text: "Ecosystem",
      items: [
        { text: "Wrapped ETH", link: "/weth" },
        { text: "Name Resolution", link: "/ens" },
      ],
    },
  ],
  topNav: [
    { text: "walletbeat", link: "https://walletbeat.eth.link" },
  ],
});
