import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { db, todos } from "../lib/db";
import { eq } from "drizzle-orm";
import { Layout } from "../index";

// ── Route ───────────────────────────────────────────────
export const todosRoute = new Hono();

// ── UI Components ───────────────────────────────────────
const TodoItem: FC<{ id: number; text: string; done: boolean }> = ({
  id,
  text,
  done,
}) => (
  <li id={`todo-${id}`} class="flex items-center gap-3 p-2">
    <input
      type="checkbox"
      class="checkbox checkbox-primary"
      checked={done}
      hx-patch={`/todos/${id}/toggle`}
      hx-target={`#todo-${id}`}
      hx-swap="outerHTML"
    />
    <span class={done ? "line-through opacity-50" : ""}>{text}</span>
    <button
      class="btn btn-ghost btn-xs ml-auto text-error"
      hx-delete={`/todos/${id}`}
      hx-target={`#todo-${id}`}
      hx-swap="delete"
    >
      ✕
    </button>
  </li>
);

const TodoList: FC<{ items: { id: number; text: string; done: boolean }[] }> = ({
  items,
}) => (
  <div id="todo-list">
    <ul class="space-y-1">
      {items.map((t) => (
        <TodoItem id={t.id} text={t.text} done={t.done} />
      ))}
    </ul>
  </div>
);

const TodoPage: FC<{ items: { id: number; text: string; done: boolean }[] }> = ({
  items,
}) => (
  <div>
    <h2 class="text-3xl font-bold mb-4">📝 Todos</h2>
    <form
      class="flex gap-2 mb-6"
      hx-post="/todos"
      hx-target="#todo-list ul"
      hx-swap="beforeend"
      hx-on--after-request="this.reset()"
    >
      <input
        type="text"
        name="text"
        placeholder="What needs to be done?"
        class="input input-bordered flex-1"
        required
      />
      <button type="submit" class="btn btn-primary">Add</button>
    </form>
    <TodoList items={items} />
    <div class="mt-4">
      <a href="/" class="btn btn-ghost btn-sm">← Home</a>
    </div>
  </div>
);

// ── GET /todos — Full page ──────────────────────────────
todosRoute.get("/", (c) => {
  const items = db.select().from(todos).all();
  return c.html(
    <Layout title="Todos — Thrust">
      <TodoPage items={items} />
    </Layout>
  );
});

// ── POST /todos — Create, return fragment ───────────────
todosRoute.post("/", async (c) => {
  const body = await c.req.parseBody();
  const text = String(body.text ?? "").trim();
  if (!text) return c.text("Text required", 400);

  const result = db.insert(todos).values({ text }).returning().get();
  return c.html(<TodoItem id={result.id} text={result.text} done={result.done} />);
});

// ── PATCH /todos/:id/toggle — Toggle done ───────────────
todosRoute.patch("/:id/toggle", (c) => {
  const id = Number(c.req.param("id"));
  const existing = db.select().from(todos).where(eq(todos.id, id)).get();
  if (!existing) return c.text("Not found", 404);

  const updated = db
    .update(todos)
    .set({ done: !existing.done })
    .where(eq(todos.id, id))
    .returning()
    .get();
  return c.html(<TodoItem id={updated.id} text={updated.text} done={updated.done} />);
});

// ── DELETE /todos/:id — Remove ──────────────────────────
todosRoute.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  db.delete(todos).where(eq(todos.id, id)).run();
  return c.body(null, 200);
});
