# AGENT.md — The Thrust Agent Protocol

You are an AI coding agent working on a **Thrust** application. Follow these rules strictly.

## Rule 1: Locality of Behavior

- Every feature lives in **one file** inside `src/features/`.
- A feature file contains: Hono route handlers, JSX UI components, Zod validation (if needed), and DB queries.
- **Never** scatter a feature across multiple directories.
- Name files as `[feature].tsx` with a colocated `[feature].test.ts`.

```
src/features/
├── todos.tsx        ← route + UI + logic
├── todos.test.ts    ← tests for todos
├── users.tsx        ← route + UI + logic
└── users.test.ts    ← tests for users
```

## Rule 2: No Client-Side State

- Use **HTMX** for all interactivity. Return **HTML fragments**, never JSON.
- No React, no Vue, no client-side state management.
- Use `hx-get`, `hx-post`, `hx-patch`, `hx-delete` to interact with Hono routes.
- Use `hx-target` and `hx-swap` to update specific DOM elements.
- For forms, use `hx-on--after-request="this.reset()"` to clear inputs.

## Rule 3: Test-Driven Development (TDD)

This is **mandatory**. Follow this exact workflow for every new feature:

1. **Create the test file first:** `src/features/[feature].test.ts`
2. **Write failing tests** that describe the expected behavior (HTTP status, HTML content).
3. **Run `bun test`** — confirm the tests fail.
4. **Implement the feature** in `src/features/[feature].tsx`.
5. **Run `bun test`** — confirm all tests pass.
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
| DB | `src/lib/db.ts` | Drizzle schema + bun:sqlite connection |
| Auth | `src/lib/auth.ts` | Better Auth config |
| Features | `src/features/*.tsx` | Self-contained feature slices |
| Tests | `src/features/*.test.ts` | Colocated bun:test files |

## How to Add a New Feature

```bash
# 1. Create test (TDD)
touch src/features/notes.test.ts

# 2. Write failing tests

# 3. Create feature
touch src/features/notes.tsx

# 4. Add DB table to src/lib/db.ts (if needed)

# 5. Mount route in src/index.tsx:
#    import { notesRoute } from "./features/notes";
#    app.route("/notes", notesRoute);

# 6. Update STATE.md

# 7. Run: bun test — all green? Done.
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
import { Layout } from "../index";

app.get("/", (c) => {
  return c.html(
    <Layout title="Page">
      <h1>Content</h1>
    </Layout>
  );
});
```

### Form with HTMX
```html
<form hx-post="/items" hx-target="#list" hx-swap="beforeend">
  <input name="text" required />
  <button type="submit">Add</button>
</form>
```
