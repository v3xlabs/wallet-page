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
            { text: "Permissions", link: "/permissions" },
            { text: "Chains", link: "/chains" },
          ],
        },
        {
          text: "Signing",
          items: [
            { text: "Personal signatures", link: "/personal-signatures" },
            { text: "Sign-In with Ethereum", link: "/siwe" },
            { text: "ERC-20 permit", link: "/erc20-permit" },
          ],
        },
        {
          text: "Tokens & assets",
          items: [
            { text: "ERC-20", link: "/erc-20" },
            { text: "ERC-721", link: "/erc-721" },
            { text: "ERC-1155", link: "/erc-1155" },
            { text: "Watch asset", link: "/eip-747" },
          ],
        },
        {
          text: "Transactions",
          items: [
            { text: "Send transaction", link: "/send-transaction" },
            { text: "Batch calls", link: "/eth-send-calls" },
            { text: "EIP-7702", link: "/eip-7702" },
          ],
        },
      ],
    },
  ],
  topNav: [
    { text: "walletbeat", link: "https://walletbeat.eth.link" },
  ],
});
