import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { notesRoute } from "./features/notes";
import { env } from "./lib/env";
import { Layout } from "./lib/layout";

const app = new Hono();

app.use("*", csrf());
app.use("*", secureHeaders());

app.onError((err, c) => {
  console.error(`Error ${c.req.method} ${c.req.path}:`, err.message);
  return c.text(`Error: ${err.message}`, 500);
});

app.use(
  "/static/*",
  serveStatic({
    root: "./public/",
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  })
);

app.get("/", (c) =>
  c.html(
    <Layout title="Notes Reference">
      <div class="hero min-h-[70vh]">
        <div class="hero-content text-center">
          <div class="max-w-2xl space-y-6">
            <h1 class="text-5xl font-bold text-primary">Notes reference app</h1>
            <p class="text-lg text-base-content/70">
              A concrete Thrust example showing SSR pages, typed JSON RPC routes, and a
              small client island.
            </p>
            <div class="flex justify-center">
              <a href="/notes" class="btn btn-primary">
                Open notes reference feature
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
);

app.route("/notes", notesRoute);

export { app };

console.log(`Notes reference app running at http://localhost:${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
