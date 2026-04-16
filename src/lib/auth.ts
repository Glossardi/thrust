import { betterAuth } from "better-auth";

// ── Better Auth Configuration ───────────────────────────
// Remove this file if you don't need authentication.
// Then remove the auth route in src/index.tsx.
export const auth = betterAuth({
  database: {
    type: "sqlite",
    url: "./data/app.db",
  },
  emailAndPassword: {
    enabled: true,
  },
});
