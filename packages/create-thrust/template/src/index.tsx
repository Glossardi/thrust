import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { Layout } from "./lib/layout";

// Features
// Import and mount your feature routes here:
// import { postsRoute } from "./features/posts";

// Auth (opt-in)
// import { auth } from "./lib/auth";

// App
const app = new Hono();

// Security
app.use("*", csrf());
app.use("*", secureHeaders());

// Error handler
app.onError((err, c) => {
  console.error(`Error ${c.req.method} ${c.req.path}:`, err.message);
  return c.text(`Error: ${err.message}`, 500);
});

// Static assets
app.use(
  "/static/*",
  serveStatic({
    root: "./public/",
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  })
);

// Home
app.get("/", (c) =>
  c.html(
    <Layout title="Thrust">
      <div class="hero min-h-[80vh]">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-6xl font-bold text-primary">Thrust</h1>
            <p class="py-6 text-lg text-base-content/60">
              Maximum Velocity, Minimal Drag.
            </p>
            <p class="text-sm text-base-content/40">
              Add your first feature in{" "}
              <code class="bg-base-200 px-1.5 py-0.5 rounded text-xs">src/features/</code>
            </p>
            <p class="mt-3 text-sm text-base-content/40">
              Use server-rendered pages, typed RPC routes, and small client islands.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
);

// Mount features
// app.route("/posts", postsRoute);

// Auth route (opt-in)
// app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Export for testing
export { app };

// Start server
const port = Number(process.env.PORT) || 3000;
console.log(`Thrust running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
