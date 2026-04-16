import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import type { FC } from "hono/jsx";

// ── Features ────────────────────────────────────────────
// Comment out any feature import to remove it. No side effects.
import { todosRoute } from "./features/todos";

// ── Auth (opt-in) ───────────────────────────────────────
// Delete the import & route below if you don't need auth.
// import { auth } from "./lib/auth";

// ── App ─────────────────────────────────────────────────
const app = new Hono();

// ── Security ────────────────────────────────────────────
app.use("*", csrf());
app.use("*", secureHeaders());

// ── Error Handler (dev-friendly) ────────────────────────
app.onError((err, c) => {
  console.error(`❌ ${c.req.method} ${c.req.path}:`, err.message);
  return c.text(`Error: ${err.message}`, 500);
});

// ── Static Assets ───────────────────────────────────────
app.use(
  "/static/*",
  serveStatic({
    root: "./public/",
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  })
);

// ── Layout ──────────────────────────────────────────────
const Layout: FC<{ title?: string }> = ({ title, children }) => (
  <html lang="en" data-theme="dark">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ?? "Thrust App"}</title>
      <link rel="stylesheet" href="/static/style.css" />
      <script src="https://unpkg.com/htmx.org@2.0.4" />
    </head>
    <body class="min-h-screen bg-base-200">
      <div class="container mx-auto max-w-2xl p-4">{children}</div>
    </body>
  </html>
);

// ── Home ────────────────────────────────────────────────
app.get("/", (c) =>
  c.html(
    <Layout title="Thrust">
      <div class="hero py-12">
        <div class="hero-content text-center">
          <div>
            <h1 class="text-5xl font-bold">🚀 Thrust</h1>
            <p class="py-4 text-lg opacity-70">
              Maximum Velocity, Minimal Drag.
            </p>
            <a href="/todos" class="btn btn-primary">
              Go to Todos →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
);

// ── Mount Features ──────────────────────────────────────
app.route("/todos", todosRoute);

// ── Auth Route (opt-in) ─────────────────────────────────
// app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// ── Export for testing ──────────────────────────────────
export { app, Layout };

// ── Start Server ────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Thrust running → http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
