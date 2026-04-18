import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:3112",
    headless: true,
  },
  webServer: {
    command: "bash -lc 'cd ../examples/notes-reference && bun run db:reset >/dev/null && PORT=3112 bun run src/index.tsx'",
    url: "http://127.0.0.1:3112",
    reuseExistingServer: !process.env.CI,
    timeout: 45_000,
  },
});
