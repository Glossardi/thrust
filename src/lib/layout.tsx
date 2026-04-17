import type { FC } from "hono/jsx";

// Layout
// Shared HTML shell used by all pages. Import in features:
//   import { Layout } from "../lib/layout";
const Layout: FC<{ title?: string }> = ({ title, children }) => (
  <html lang="en" data-theme="thrust">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ?? "Thrust App"}</title>
      <link rel="stylesheet" href="/static/style.css" />
      <script src="https://unpkg.com/htmx.org@2.0.4" />
    </head>
    <body class="min-h-screen bg-base-100">
      <div class="container mx-auto max-w-5xl px-4 py-6">{children}</div>
    </body>
  </html>
);

export { Layout };
