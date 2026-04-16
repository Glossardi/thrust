# STATE.md — Thrust App Context Map

## Routes
- `GET /` — Landing page (hero with link to todos)
- `GET /todos` — Full todos page with form and list
- `POST /todos` — Create todo, returns `<li>` fragment
- `PATCH /todos/:id/toggle` — Toggle todo done state, returns `<li>` fragment
- `DELETE /todos/:id` — Delete todo, returns empty 200

## DB Tables
- `todos` — `id` (int, PK), `text` (text), `done` (boolean, default false)

## Features
- `src/features/todos.tsx` — Todo CRUD with HTMX interactivity

## Auth
- Better Auth configured but **not mounted** (commented out in index.tsx)

## Styles
- Tailwind v4 + DaisyUI, dark theme default
- CSS output: `public/style.css` (build via `bun run build:css`)
