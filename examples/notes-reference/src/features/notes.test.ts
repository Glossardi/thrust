import { beforeEach, describe, expect, test } from "bun:test";
import { app } from "../index";
import { db } from "../lib/db";
import { notes } from "../lib/db";

async function createNote(payload: { title: string; content?: string; category?: "general" | "work" | "personal" }) {
  const res = await app.request("/notes/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify({
      content: "",
      category: "general",
      ...payload,
    }),
  });

  return res;
}

beforeEach(() => {
  db.delete(notes).run();
});

describe("GET /notes", () => {
  test("returns the notes page", async () => {
    const res = await app.request("/notes");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Notes reference");
    expect(html).toContain("typed JSON RPC routes");
    expect(html).toContain("/static/islands/notes.client.js");
  });
});

describe("GET /notes/api", () => {
  test("returns notes JSON with pinned notes first", async () => {
    await createNote({ title: "General note", category: "general" });
    const created = await createNote({ title: "Pinned note", category: "work" });
    const createdJson = await created.json();

    await app.request(`/notes/api/${createdJson.note.id}/pin`, {
      method: "PATCH",
      headers: { Origin: "http://localhost" },
    });

    const res = await app.request("/notes/api");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.notes).toHaveLength(2);
    expect(data.notes[0].title).toBe("Pinned note");
    expect(data.notes[0].pinned).toBe(true);
  });
});

describe("POST /notes/api", () => {
  test("creates a note and returns 201", async () => {
    const res = await createNote({ title: "Ship the reference", content: "Add a real example.", category: "work" });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.note.title).toBe("Ship the reference");
    expect(data.note.category).toBe("work");
  });

  test("rejects an empty title", async () => {
    const res = await createNote({ title: "", category: "general" });
    expect(res.status).toBe(400);
  });

  test("rejects an invalid category", async () => {
    const res = await app.request("/notes/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: JSON.stringify({ title: "Bad", content: "", category: "unknown" }),
    });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /notes/api/:id/pin", () => {
  test("toggles pin state", async () => {
    const created = await createNote({ title: "Toggle me" });
    const data = await created.json();

    const res = await app.request(`/notes/api/${data.note.id}/pin`, {
      method: "PATCH",
      headers: { Origin: "http://localhost" },
    });

    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.note.pinned).toBe(true);
  });
});

describe("DELETE /notes/api/:id", () => {
  test("deletes a note", async () => {
    const created = await createNote({ title: "Delete me" });
    const data = await created.json();

    const res = await app.request(`/notes/api/${data.note.id}`, {
      method: "DELETE",
      headers: { Origin: "http://localhost" },
    });

    expect(res.status).toBe(200);

    const list = await app.request("/notes/api");
    const listData = await list.json();
    expect(listData.notes).toHaveLength(0);
  });
});

describe("GET /notes/api/filter", () => {
  test("returns only work notes", async () => {
    await createNote({ title: "Work note", category: "work" });
    await createNote({ title: "Personal note", category: "personal" });

    const res = await app.request("/notes/api/filter?category=work");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0].category).toBe("work");
  });

  test("returns all notes for category=all", async () => {
    await createNote({ title: "One", category: "work" });
    await createNote({ title: "Two", category: "personal" });

    const res = await app.request("/notes/api/filter?category=all");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.notes).toHaveLength(2);
  });
});
