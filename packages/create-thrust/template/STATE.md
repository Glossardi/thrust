# STATE.md - Thrust App Context Map

## Routes
- `GET /` - Landing page

## DB Tables
- *(none yet - add tables in `src/lib/db.ts`)*

## Features
- *(none yet - add features in `src/features/`)*

## Shared Modules
- `src/lib/layout.tsx` - HTML layout shell with Thrust theme
- `src/lib/island.tsx` - Standard server-side island mount helper
- `src/lib/db.ts` - Database connection + schema (opt-in)
- `src/lib/auth.ts` - Better Auth config (opt-in)

## Styles
- Tailwind v4 + DaisyUI with custom "thrust" theme
- CSS output: `public/style.css` (build via `bun run build:css`)

## Browser Assets
- Client islands bundle to `public/islands/` via `bun run build:client`
