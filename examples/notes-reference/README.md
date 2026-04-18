# Notes Reference App

This example app demonstrates the recommended Thrust architecture for interactive features:

- server-rendered pages
- typed JSON RPC routes
- Zod validation
- small browser islands with `hono/jsx/dom`
- local UI state with `useState`

## Run

```bash
bun install
bun run build:client
bun run build:css
bun dev
```

Open `http://localhost:3000/notes`.
