import type { FC } from "hono/jsx";

const Layout: FC<{ title?: string }> = ({ title, children }) => (
  <html lang="en" data-theme="thrust">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ?? "Notes Reference"}</title>
      <link rel="stylesheet" href="/static/style.css" />
    </head>
    <body class="min-h-screen bg-base-100 text-base-content">
      <div class="container mx-auto max-w-5xl px-4 py-6">{children}</div>
    </body>
  </html>
);

export { Layout };
