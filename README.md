# Thrust

**Maximum Velocity, Minimal Drag.**

A hyper-optimized full-stack micro-framework built for AI coding agents. Server-rendered, zero hydration, zero config.

## Quickstart

### Use this repository directly

```bash
bun install
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
| `bun dev` | Start dev server with hot-reload |
| `bun test` | Run all tests once |
| `bun test --watch` | Run tests in watch mode |
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
|  |- db.ts               # Schema + bun:sqlite connection (opt-in)
|  `- auth.ts             # Better Auth (opt-in)
`- features/
   |- [feature].tsx       # Route + UI + DB logic in one file
   `- [feature].test.ts   # Colocated test
```

### Locality of Behavior
Every feature is a **single file** in `src/features/`. Route handlers, JSX components, and DB queries live together. No hunting across multiple directories.

## Modularity: Use What You Need

### Want a minimal static site?
1. Keep `src/lib/layout.tsx`
2. Delete `src/lib/db.ts` and `src/lib/auth.ts` if you do not need database or auth
3. You now have a pure Hono SSR server. Add your own routes in `src/index.tsx`.

### Want a full SaaS?
Keep everything. Add features in `src/features/`, tables in `src/lib/db.ts`. Auth is ready via Better Auth.

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Runtime | **Bun** | Fast, built-in SQLite, built-in test runner |
| Server | **Hono** | Ultra-fast, JSX support, middleware ecosystem |
| UI | **Hono JSX** | Server-rendered HTML, zero bundle, zero hydration |
| Interactivity | **HTMX** | HTML-over-the-wire, no client JS framework |
| Database | **bun:sqlite + Drizzle ORM** | Embedded, zero setup, type-safe |
| Auth | **Better Auth** | Simple, framework-agnostic |
| Styling | **Tailwind v4 + DaisyUI** | Utility-first + custom "thrust" theme |
| Security | **Hono CSRF + Secure Headers** | On by default |

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
3. **Zero config** - No webpack, no vite, no next.config.js. Just `bun dev`.
4. **Opt-in complexity** - Start with a blank canvas, add DB/Auth when you need it.

## License

MIT
