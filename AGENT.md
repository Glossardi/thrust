# AGENT.md — The Thrust Agent Protocol

You are an AI coding agent working on a **Thrust** application. Follow these rules strictly.

## Rule 1: Locality of Behavior

- Every feature lives in **one file** inside `src/features/`.
- A feature file contains: Hono route handlers, JSX UI components, Zod validation (if needed), and DB queries.
- **Never** scatter a feature across multiple directories.
- Name files as `[feature].tsx` with a colocated `[feature].test.ts`.

```
src/features/
├── posts.tsx        ← route + UI + logic
├── posts.test.ts    ← tests for posts
├── users.tsx        ← route + UI + logic
└── users.test.ts    ← tests for users
```

## Rule 2: No Client-Side State

- Use **HTMX** for all interactivity. Return **HTML fragments**, never JSON.
- No React, no Vue, no client-side state management.
- Use `hx-get`, `hx-post`, `hx-patch`, `hx-delete` to interact with Hono routes.
- Use `hx-target` and `hx-swap` to update specific DOM elements.
- For forms, use `hx-on:htmx:after-request` (see Pitfalls below for the correct JSX syntax).

## Rule 3: Test-Driven Development (TDD)

This is **mandatory**. Follow this exact workflow for every new feature:

1. **Create the test file first:** `src/features/[feature].test.ts`
2. **Write failing tests** that describe the expected behavior (HTTP status, HTML content).
3. **Run `bun test src/`** — confirm the tests fail.
4. **Implement the feature** in `src/features/[feature].tsx`.
5. **Run `bun test src/`** — confirm all tests pass.
6. **Never tell the user "done" until tests pass.**

### Test Pattern

```ts
import { describe, test, expect } from "bun:test";
import { app } from "../index";

describe("GET /[feature]", () => {
  test("returns 200 with expected content", async () => {
    const res = await app.request("/[feature]");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Expected Content");
  });
});
```

## Rule 4: Maintain STATE.md

After **every** change that adds/removes/modifies:
- A route
- A DB table or column
- A feature file

You **must** update `STATE.md`. Keep it as a flat bullet list. Minimal tokens.

## Rule 5: Keep It Minimal

- Use **Tailwind utility classes**. No custom CSS files.
- Use **DaisyUI component classes** (`btn`, `input`, `card`, etc.) for rapid UI.
- Prefer Hono's built-in helpers over external middleware.
- Write the **least code** that fulfills the requirement.
- One import per line. No barrel exports.

## Architecture Reference

| Layer | File | Purpose |
|-------|------|---------|
| Entry | `src/index.tsx` | Mounts security, static files, features |
| Layout | `src/lib/layout.tsx` | Shared HTML shell (import in features) |
| DB | `src/lib/db.ts` | Drizzle schema + bun:sqlite connection + auto-migrate |
| Auth | `src/lib/auth.ts` | Better Auth config |
| Features | `src/features/*.tsx` | Self-contained feature slices |
| Tests | `src/features/*.test.ts` | Colocated bun:test files |

### Where Shared Code Lives

- `src/lib/layout.tsx` — The `<Layout>` component. **Always import from here**, never from `index.tsx`.
- `src/lib/db.ts` — Database schema, connection, and auto-migrate.
- `src/lib/` — Add other shared utilities here (e.g., `icons.tsx`, `logger.ts`, `env.ts`).
- `src/features/` — Feature-specific code only. Each feature imports from `src/lib/` as needed.

## How to Add a New Feature

```bash
# 1. Create test (TDD)
touch src/features/notes.test.ts

# 2. Write failing tests

# 3. Create feature
touch src/features/notes.tsx

# 4. Add DB table to src/lib/db.ts:
#    - Drizzle schema definition (export const ...)
#    - CREATE TABLE IF NOT EXISTS in auto-migrate section

# 5. Mount route in src/index.tsx:
#    import { notesRoute } from "./features/notes";
#    app.route("/notes", notesRoute);

# 6. Update STATE.md

# 7. Run: bun test src/ — all green? Done.
```

## Common Patterns

### Return HTML Fragment (for HTMX)
```tsx
app.post("/items", async (c) => {
  // ... create item ...
  return c.html(<ItemComponent {...item} />);
});
```

### Full Page with Layout
```tsx
import { Layout } from "../lib/layout";

app.get("/", (c) => {
  return c.html(
    <Layout title="Page">
      <h1>Content</h1>
    </Layout>
  );
});
```

### Form with HTMX
```tsx
<form hx-post="/items" hx-target="#list" hx-swap="beforeend"
      {...{ "hx-on:htmx:after-request": "this.reset()" }}>
  <input name="text" required />
  <button type="submit">Add</button>
</form>
```

## Pitfalls — Read Before Coding

These are common mistakes. Avoid them.

### CSRF on Mutating Requests
Thrust enables CSRF protection globally. In **tests**, all `POST`, `PATCH`, `PUT`, `DELETE` requests need an `Origin` header or they'll get a `403`:
```ts
// ❌ Will return 403
const res = await app.request("/items", { method: "POST", body: form });

// ✅ Correct
const res = await app.request("/items", {
  method: "POST",
  headers: { Origin: "http://localhost" },
  body: form,
});
```

### Drizzle + bun:sqlite: Use `.get()` After `.returning()`
With bun:sqlite, `.returning()` alone is **not** iterable. Always chain `.get()` for a single row:
```ts
// ❌ Runtime crash: "is not iterable"
const [created] = db.insert(items).values({ name }).returning();

// ✅ Correct
const created = db.insert(items).values({ name }).returning().get();
```

### HTMX: Use Absolute Paths in `hx-*` Attributes
Feature routes are mounted on sub-paths (e.g., `/notes`). HTMX attributes must use **full absolute paths**, not relative:
```tsx
// ❌ Resolves to current page path, not /notes/5
hx-delete="/5"

// ✅ Correct
hx-delete={`/notes/${id}`}
```

### HTMX: `hx-on` Event Attributes in JSX
Hono JSX does **not** support `hx-on::after-request` (double colon namespace syntax). Use the `hx-on:` prefix with a spread:
```tsx
// ❌ JSX parse error: "Expected identifier after hx-on:"
<form hx-on::after-request="this.reset()" />

// ✅ Correct — use spread for namespaced attributes
<form {...{ "hx-on:htmx:after-request": "this.reset()" }} />
```

### HTMX: Partial Swaps Lose Surrounding State
When using `hx-target` to replace only part of a page (e.g., a list), any UI state *outside* that target (dropdown selections, scroll position) is preserved. But if you accidentally swap a **parent** element that contains both the control and the list, the control resets. Keep your `hx-target` as narrow as possible.

### Layout: Always Import from `src/lib/layout.tsx`
Never import `Layout` from `index.tsx` — this causes circular imports when `index.tsx` imports your feature route.
```tsx
// ❌ Circular import crash: "Cannot access before initialization"
import { Layout } from "../index";

// ✅ Correct
import { Layout } from "../lib/layout";
```

### Large Feature Files: Split When Needed
If a feature file grows beyond ~200 lines, split helper components into `src/lib/` while keeping routes in the feature file. The route handlers stay in `src/features/`, shared UI components move to `src/lib/`.
