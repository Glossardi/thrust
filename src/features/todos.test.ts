import { describe, test, expect, afterAll } from "bun:test";
import { app } from "../index";
import { db, todos } from "../lib/db";
import { sql } from "drizzle-orm";

// ── Cleanup after all tests ─────────────────────────────
afterAll(() => {
  db.delete(todos).run();
});

// ── GET Routes ──────────────────────────────────────────
describe("GET /", () => {
  test("returns 200 with Thrust landing page", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Thrust");
    expect(html).toContain("Go to Todos");
  });
});

describe("GET /todos", () => {
  test("returns 200 with HTML containing the todos heading", async () => {
    const res = await app.request("/todos");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("📝 Todos");
    expect(html).toContain("What needs to be done?");
  });

  test("returns full HTML page with shared layout", async () => {
    const res = await app.request("/todos");
    const html = await res.text();
    expect(html).toContain("<html");
    expect(html).toContain("htmx.org");
    expect(html).toContain("style.css");
  });
});

// ── POST /todos ─────────────────────────────────────────
describe("POST /todos", () => {
  test("creates a todo and returns HTML fragment", async () => {
    const form = new FormData();
    form.append("text", "Test todo from bun:test");

    const res = await app.request("/todos", {
      method: "POST",
      headers: { Origin: "http://localhost" },
      body: form,
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Test todo from bun:test");
    expect(html).toContain("<li");
  });

  test("rejects empty text with 400", async () => {
    const form = new FormData();
    form.append("text", "   ");

    const res = await app.request("/todos", {
      method: "POST",
      headers: { Origin: "http://localhost" },
      body: form,
    });

    expect(res.status).toBe(400);
  });
});

// ── PATCH /todos/:id/toggle ─────────────────────────────
describe("PATCH /todos/:id/toggle", () => {
  test("toggles a todo's done state", async () => {
    // Create a todo first
    const created = db
      .insert(todos)
      .values({ text: "Toggle me" })
      .returning()
      .get();

    const res = await app.request(`/todos/${created.id}/toggle`, {
      method: "PATCH",
      headers: { Origin: "http://localhost" },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Toggle me");
    expect(html).toContain("line-through");
  });

  test("returns 404 for non-existent todo", async () => {
    const res = await app.request("/todos/99999/toggle", {
      method: "PATCH",
      headers: { Origin: "http://localhost" },
    });

    expect(res.status).toBe(404);
  });
});

// ── DELETE /todos/:id ───────────────────────────────────
describe("DELETE /todos/:id", () => {
  test("deletes a todo and returns 200", async () => {
    const created = db
      .insert(todos)
      .values({ text: "Delete me" })
      .returning()
      .get();

    const res = await app.request(`/todos/${created.id}`, {
      method: "DELETE",
      headers: { Origin: "http://localhost" },
    });

    expect(res.status).toBe(200);

    // Verify it's actually gone
    const check = db.select().from(todos).where(sql`id = ${created.id}`).get();
    expect(check).toBeUndefined();
  });
});
