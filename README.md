# 🚀 Thrust

**Maximum Velocity, Minimal Drag.**

A hyper-optimized full-stack micro-framework built for AI coding agents. Server-rendered, zero hydration, zero config.

## Quickstart

```bash
bun install
bun run build:css
bun dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

## Commands

| Command | What it does |
|---------|-------------|
| `bun dev` | Start dev server with hot-reload |
| `bun test` | Run all tests once |
| `bun test --watch` | Run tests in watch mode |
| `bun run build:css` | Build Tailwind CSS → `public/style.css` |
| `bun run db:push` | Push Drizzle schema to SQLite |
| `bun run db:reset` | Delete and recreate the database |

## Architecture

```
src/
├── index.tsx              ← App entry, layout, security, mounts features
├── lib/
│   ├── db.ts              ← Drizzle + bun:sqlite (opt-in)
│   └── auth.ts            ← Better Auth (opt-in)
└── features/
    ├── todos.tsx           ← Route + UI + DB logic in ONE file
    └── todos.test.ts       ← Colocated test
```

### Locality of Behavior
Every feature is a **single file** in `src/features/`. Route handlers, JSX components, and DB queries live together. No hunting across 5 directories.

## Modularity — Use What You Need

### Want a minimal static site?
1. Delete `src/lib/`
2. Comment out the feature imports in `src/index.tsx`
3. You now have a pure Hono SSR server. Add your own routes.

### Want a full SaaS?
Keep everything. Add features in `src/features/`. Auth is already wired via Better Auth.

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Runtime | **Bun** | Fast, built-in SQLite, built-in test runner |
| Server | **Hono** | Ultra-fast, JSX support, middleware ecosystem |
| UI | **Hono JSX** | Server-rendered HTML, zero bundle, zero hydration |
| Interactivity | **HTMX** | HTML-over-the-wire, no client JS framework |
| Database | **bun:sqlite + Drizzle** | Embedded, zero setup, type-safe |
| Auth | **Better Auth** | Simple, framework-agnostic |
| Styling | **Tailwind v4 + DaisyUI** | Utility-first + component classes |
| Security | **Hono CSRF + Secure Headers** | On by default |

## Philosophy

1. **AI-first DX** — Small files, colocated logic, minimal context needed
2. **TDD by default** — Tests live next to features. Agents verify before humans review.
3. **Zero config** — No webpack, no vite, no next.config.js. Just `bun dev`.
4. **Opt-in complexity** — Start minimal, add DB/Auth when you need it.

## License

MIT
