import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolveConfig } from "vocs/config";
import { vocs } from "vocs/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const config = await resolveConfig({ rootDir });

  return {
    root: rootDir,
    plugins: [react(), ...(await vocs())],
    build: {
      outDir: config.outDir,
    },
  };
});
