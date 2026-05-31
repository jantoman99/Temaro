import path from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.ts",
        "proxy.ts",
      ],
      exclude: [
        "app/**/page.tsx",
        "app/**/layout.tsx",
        "app/**/loading.tsx",
        "app/icon.svg",
        "components/**/*.tsx",
        "lib/demo/**",
        "types/**",
      ],
    },
    environment: "node",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    globals: false,
  },
});
