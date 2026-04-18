# Thrust

**Maximum Velocity, Minimal Drag.**

A hyper-optimized full-stack micro-framework built for AI coding agents. Server-rendered, zero hydration by default, zero config.

## Quickstart

### Use this repository directly

```bash
bun install
bun run build:client
bun run build:css
bun dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

## Scaffolder

The `create-thrust` scaffolder lives in this repository under `packages/create-thrust/`.

Local usage while developing the framework:

```bash
node packages/create-thrust/bin/create-thrust.js my-app
```

Planned public install path after the first npm release:

```bash
bunx create-thrust my-app
```

## Commands

| Command | What it does |
|---------|--------------|
| `bun dev` | Start server watch, client bundle watch, and CSS watch |
| `bun test` | Run all tests once |
| `bun test --watch` | Run tests in watch mode |
| `bun run build:client` | Bundle `*.client.tsx` browser islands into `public/islands/` |
| `bun run build:css` | Build Tailwind CSS to `public/style.css` |
| `bun run db:reset` | Delete and recreate the database |

## Scaffolder variants

```bash
node packages/create-thrust/bin/create-thrust.js my-app          # minimal
node packages/create-thrust/bin/create-thrust.js my-app --db     # include db.ts
node packages/create-thrust/bin/create-thrust.js my-app --auth   # include db.ts + auth.ts
```

## Architecture

```text
src/
|- index.tsx              # App entry, security, mounts features
|- lib/
|  |- layout.tsx          # Shared HTML layout (import in features)
|  |- island.tsx          # Standard server-side island mount helper
|  |- db.ts               # Schema + bun:sqlite connection (opt-in)
|  `- auth.ts             # Better Auth (opt-in)
`- features/
   |- [feature].tsx       # SSR route + RPC routes + schemas
   |- [feature].client.tsx# Browser-only island
   `- [feature].test.ts   # Colocated test
```

### Locality of Behavior
Every feature stays local. Server-rendered pages, RPC routes, schemas, browser islands, and tests stay in one feature slice with a shared basename.

## Modularity: Use What You Need

### Want a minimal static site?
1. Keep `src/lib/layout.tsx`
2. Add islands only where you need interactivity
3. Add `src/lib/db.ts` and `src/lib/auth.ts` later if your app needs persistence or authentication
4. You still get a pure Hono SSR server by default

### Want a full SaaS?
Keep everything. Add features in `src/features/`, tables in `src/lib/db.ts`, auth in `src/lib/auth.ts`, and small islands only for interactive UI.

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Runtime | **Bun** | Fast, built-in SQLite, built-in test runner, built-in bundler |
| Server | **Hono** | Ultra-fast, JSX support, middleware ecosystem |
| UI | **Hono JSX** | Server-rendered HTML with a small client-side companion runtime |
| Interactivity | **Hono RPC + Hono Client Components** | Typed client/server contract with small islands |
| Validation | **Zod + @hono/zod-validator** | Explicit request contracts and typed validation |
| Database | **bun:sqlite + Drizzle ORM** | Embedded, zero setup, type-safe |
| Auth | **Better Auth** | Simple, framework-agnostic |
| Styling | **Tailwind v4 + DaisyUI** | Utility-first + custom "thrust" theme |
| Security | **Hono CSRF + Secure Headers** | On by default |

## Interaction Model

Thrust uses a strict interaction model designed for AI coding agents:

- page routes render HTML on the server
- RPC routes return typed JSON with explicit status codes
- browser islands call those routes with `hc()`
- local UI state lives in `useState()` and related hooks

This keeps interactive behavior explicit and moves failures into TypeScript, validation, tests, and build output instead of browser-only DOM behavior.

## Database

Thrust uses `bun:sqlite` (zero deps, built into Bun) with Drizzle ORM for type-safe queries.

**Schema + auto-migrate lives in one file:** `src/lib/db.ts`. Define your Drizzle table, add a matching `CREATE TABLE IF NOT EXISTS`, done. Tables are created automatically on app start.

**Need production migrations?** Add `drizzle-kit` when you're ready:
```bash
bun add -d drizzle-kit better-sqlite3
```
Then create a `drizzle.config.ts` pointing to your schema. See [Drizzle Kit docs](https://orm.drizzle.team/kit-docs/overview).

## Philosophy

1. **AI-first DX** - Small files, colocated logic, minimal context needed
2. **TDD by default** - Tests live next to features. Agents verify before humans review.
3. **Zero config** - No webpack, no vite, no next.config.js. Just Bun.
4. **Opt-in complexity** - Start with a blank canvas, add DB, auth, and islands when you need them.

## License

MIT
