# AGENT.md - The Thrust Agent Protocol

You are an AI coding agent working on a **Thrust** application. Follow these rules strictly.

## Rule 1: Locality of Behavior

- Every feature lives in one feature slice under `src/features/`.
- The default slice is three colocated files with the same basename:
  - `[feature].tsx`
  - `[feature].client.tsx`
  - `[feature].test.ts`
- `[feature].tsx` owns server-rendered pages, RPC routes, validation, and server-side feature logic.
- `[feature].client.tsx` owns browser-only interactive UI.
- `[feature].test.ts` owns feature tests.
- Do not scatter one feature across multiple unrelated directories.

```text
src/features/
|- posts.tsx           # SSR route + RPC routes + schemas
|- posts.client.tsx    # browser-only island
|- posts.test.ts       # tests
|- users.tsx           # SSR route + RPC routes + schemas
|- users.client.tsx    # browser-only island
`- users.test.ts       # tests
```

## Rule 2: Islands Architecture and End-to-End Type Safety

- Render full pages on the server with Hono JSX.
- Use small client islands only for interactive UI.
- Islands call backend routes through `hc()` from `hono/client`.
- RPC routes must return typed JSON with explicit status codes.
- Validate request inputs with `zod` and `@hono/zod-validator`.
- Keep UI state local to the island with `useState()` and related hooks.
- Do not use HTML fragment swapping as the primary interaction contract.
- Do not introduce external client state libraries.

## Rule 3: Test-Driven Development (TDD)

This is mandatory. Follow this workflow for every new feature:

1. Create the test file first: `src/features/[feature].test.ts`
2. Write failing tests for page routes and RPC routes.
3. Run `bun test src/` and confirm the tests fail.
4. Implement the server feature and client island.
5. Run `bun run build:client`.
6. Run `bun test src/` and confirm all tests pass.
7. Never tell the user "done" until tests pass.

### Test Pattern

```ts
import { describe, expect, test } from "bun:test";
import { app } from "../index";

describe("GET /notes", () => {
  test("returns 200 with the notes page", async () => {
    const res = await app.request("/notes");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Notes");
  });
});

describe("POST /notes/api", () => {
  test("creates a note", async () => {
    const res = await app.request("/notes/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: JSON.stringify({ title: "First note" }),
    });

    expect(res.status).toBe(201);
  });
});
```

## Rule 4: Maintain STATE.md

After every change that adds, removes, or modifies:
- a route
- a DB table or column
- a feature file
- a shared framework primitive

You must update `STATE.md`. Keep it flat and concise.

## Rule 5: Keep It Minimal

- Use Tailwind utility classes. No custom CSS files.
- Use DaisyUI component classes for fast, readable UI.
- Prefer Hono built-ins over extra abstractions.
- Write the least code that fulfills the requirement.
- One import per line. No barrel exports.
- Keep islands small. Most UI should stay server-rendered.

## Architecture Reference

| Layer | File | Purpose |
|-------|------|---------|
| Entry | `src/index.tsx` | Mounts security, static files, and features |
| Layout | `src/lib/layout.tsx` | Shared HTML shell |
| Islands | `src/lib/island.tsx` | Standard island mount helper |
| DB | `src/lib/db.ts` | Drizzle schema + bun:sqlite connection + auto-migrate |
| Auth | `src/lib/auth.ts` | Better Auth config |
| Features | `src/features/*.tsx` | SSR routes + RPC routes + schemas |
| Islands | `src/features/*.client.tsx` | Browser-only UI |
| Tests | `src/features/*.test.ts` | Colocated bun:test files |

### Where Shared Code Lives

- `src/lib/layout.tsx` - shared HTML shell
- `src/lib/island.tsx` - standard way to mount an island from a server-rendered page
- `src/lib/db.ts` - schema, connection, and auto-migrate
- `src/lib/auth.ts` - auth setup
- `src/lib/` - other genuinely shared helpers such as `env.ts`, `icons.tsx`, or `logger.ts`
- `src/features/` - feature-specific code only

## Feature Blueprint: Todo Example

Use this pattern when adding a new interactive feature.

### 1. Define schemas
In `src/features/todos.tsx`, define request schemas first.

```ts
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
});
```

### 2. Write RPC routes with validation
Use `zValidator()` and explicit JSON status codes.

```ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const todosApi = new Hono()
  .get("/", (c) => {
    return c.json({ todos: [] }, 200);
  })
  .post("/", zValidator("json", createTodoSchema), async (c) => {
    const data = c.req.valid("json");
    return c.json({ todo: { id: 1, title: data.title } }, 201);
  });

export type TodosApiType = typeof todosApi;
```

### 3. Write the SSR page route
Render layout on the server and mount the island.

```tsx
import { Layout } from "../lib/layout";
import { Island } from "../lib/island";

const todosPage = new Hono().get("/", (c) => {
  return c.html(
    <Layout title="Todos">
      <h1 class="text-3xl font-semibold">Todos</h1>
      <Island entry="todos.client" props={{ initialTodos: [] }} />
    </Layout>
  );
});
```

### 4. Export one feature router
Mount page and API routes under the same feature root.

```ts
const todosRoute = new Hono()
  .route("/", todosPage)
  .route("/api", todosApi);

export { todosRoute };
```

### 5. Write the island
In `src/features/todos.client.tsx`, keep browser logic local and typed.

```tsx
/** @jsxImportSource hono/jsx/dom */
import { hc } from "hono/client";
import { render } from "hono/jsx/dom";
import { useState } from "hono/jsx";
import type { TodosApiType } from "./todos";

const client = hc<TodosApiType>("/todos/api");

function TodosIsland(props: { initialTodos: Array<{ id: number; title: string }> }) {
  const [todos, setTodos] = useState(props.initialTodos);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function createTodo() {
    setSaving(true);
    const res = await client.index.$post({
      json: { title },
    });

    if (res.status === 201) {
      const data = await res.json();
      setTodos([...todos, data.todo]);
      setTitle("");
    }

    setSaving(false);
  }

  return (
    <div class="space-y-4">
      <input
        class="input input-bordered w-full"
        value={title}
        onInput={(event) => setTitle(event.currentTarget.value)}
      />
      <button class="btn btn-primary" disabled={saving} onClick={createTodo}>
        {saving ? "Saving..." : "Add todo"}
      </button>
      <ul class="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default function mount(rootId: string, propsScriptId: string) {
  const root = document.getElementById(rootId);
  const propsNode = document.getElementById(propsScriptId);
  if (!root || !propsNode) return;

  const props = JSON.parse(propsNode.textContent ?? "null") as {
    initialTodos: Array<{ id: number; title: string }>;
  };

  render(<TodosIsland {...props} />, root);
}
```

## Common Patterns

### Page Route
```tsx
app.get("/", (c) => {
  return c.html(
    <Layout title="Page">
      <Island entry="page.client" props={{}} />
    </Layout>
  );
});
```

### Typed JSON Response
```ts
return c.json({ message: "Created" }, 201);
```

### Client RPC Call
```ts
const res = await client.index.$post({
  json: { title: "Hello" },
});
```

## Pitfalls: Read Before Coding

### Always Use Explicit JSON Status Codes
Typed RPC works best when every branch returns `c.json(..., status)`.

```ts
// Bad
return c.notFound();

// Good
return c.json({ error: "Not found" }, 404);
```

### Set Content-Type Headers in Tests
When testing JSON or form validators, set the correct `Content-Type` header.

```ts
const res = await app.request("/todos/api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "http://localhost",
  },
  body: JSON.stringify({ title: "Hello" }),
});
```

### CSRF Still Applies to Mutating Requests
`POST`, `PATCH`, `PUT`, and `DELETE` tests still need an `Origin` header because CSRF protection is enabled globally.

### Do Not Import Server-Only Modules Into `*.client.tsx`
Never import database clients, Bun-only APIs, or server entry files into browser islands.
Add `/** @jsxImportSource hono/jsx/dom */` at the top of client island files.

### Keep RPC Types Feature-Local
Prefer:
- `type TodosApiType = typeof todosApi`

Do not build one global mega-client unless you have a very strong reason.

### Use the Standard Island Mount Helper
Do not invent a custom mount protocol for each feature. Use `src/lib/island.tsx` and the default `mount(rootId, propsScriptId)` shape.

### Keep Islands Small
If most of a page is static, render it on the server. Only move the interactive subtree into a client island.

### Large Feature Files: Split Carefully
If `feature.tsx` grows too large, split only genuinely shared pieces into `src/lib/`. Keep the server routes in `feature.tsx` and the browser logic in `feature.client.tsx`.
