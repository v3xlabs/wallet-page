import v3xlabs from "eslint-plugin-v3xlabs";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".vocs/**",
      ".devenv/**",
      ".pnpm-store/**",
      "pages.gen.ts",
    ],
  },
  ...v3xlabs.configs.recommended,
  ...v3xlabs.configs.react,
  {
    // Framework entrypoints that must use default exports.
    files: ["pages/**/*.tsx", "vocs.config.ts", "eslint.config.mjs"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
