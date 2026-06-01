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
    files: ["**/*.{ts,tsx,mts,js,mjs}"],
    rules: {
      // This is a component-heavy React codebase; named function components and
      // hooks read better as declarations than as arrow consts.
      "func-style": "off",
      // The bare-`id` ban targets entity identifiers, but it also trips on
      // object keys and DOM/React `id` props that read perfectly well here.
      "no-restricted-syntax": "off",
      // React components legitimately `return null`.
      "unicorn/no-null": "off",
      // Data-fetch-on-mount and SSR portal targets legitimately set state in an
      // effect; keep this visible as a warning instead of a hard failure.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Framework entrypoints that must use default exports.
    files: ["pages/**/*.tsx", "vocs.config.ts", "eslint.config.mjs"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
