import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { noteCategories } from "../lib/db";
import type { NoteCategory } from "../lib/db";
import type { NoteRecord } from "../lib/db";
import { notes } from "../lib/db";
import { Island } from "../lib/island";
import { Layout } from "../lib/layout";

const filterValues = ["all", ...noteCategories] as const;
type NoteFilter = typeof filterValues[number];

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().max(500).default(""),
  category: z.enum(noteCategories).default("general"),
});

const filterSchema = z.object({
  category: z.enum(filterValues).default("all"),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function validationHook(result: { success: boolean; error?: z.ZodError }, c: any) {
  if (!result.success && result.error) {
    return c.json(
      {
        error: "Invalid request",
        issues: result.error.flatten(),
      },
      400
    );
  }
}

async function listNotes(filter: NoteFilter = "all") {
  if (filter === "all") {
    return db.select().from(notes).orderBy(desc(notes.pinned), desc(notes.createdAt)).all();
  }

  return db
    .select()
    .from(notes)
    .where(eq(notes.category, filter))
    .orderBy(desc(notes.pinned), desc(notes.createdAt))
    .all();
}

const notesApi = new Hono()
  .get("/", async (c) => {
    const allNotes = await listNotes();
    return c.json({ notes: allNotes }, 200);
  })
  .get("/filter", zValidator("query", filterSchema, validationHook), async (c) => {
    const { category } = c.req.valid("query");
    const filteredNotes = await listNotes(category);
    return c.json({ notes: filteredNotes }, 200);
  })
  .post("/", zValidator("json", createNoteSchema, validationHook), async (c) => {
    const { title, content, category } = c.req.valid("json");
    const created = db
      .insert(notes)
      .values({
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    return c.json({ note: created }, 201);
  })
  .patch("/:id/pin", zValidator("param", idParamSchema, validationHook), async (c) => {
    const { id } = c.req.valid("param");
    const existing = db.select().from(notes).where(eq(notes.id, id)).get();

    if (!existing) {
      return c.json({ error: "Note not found" }, 404);
    }

    const updated = db
      .update(notes)
      .set({ pinned: !existing.pinned })
      .where(eq(notes.id, id))
      .returning()
      .get();

    return c.json({ note: updated }, 200);
  })
  .delete("/:id", zValidator("param", idParamSchema, validationHook), async (c) => {
    const { id } = c.req.valid("param");
    const deleted = db.delete(notes).where(eq(notes.id, id)).returning().get();

    if (!deleted) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ ok: true }, 200);
  });

const notesPage = new Hono().get("/", async (c) => {
  const initialNotes = await listNotes();

  return c.html(
    <Layout title="Notes reference">
      <div class="space-y-8">
        <div class="space-y-3">
          <a href="/" class="link link-hover text-sm text-base-content/60">
            Back to home
          </a>
          <h1 class="text-4xl font-semibold">Notes reference</h1>
          <p class="max-w-2xl text-base-content/70">
            This feature demonstrates the recommended Thrust path for interactive fullstack UI:
            server-rendered pages, typed JSON RPC routes, Zod validation, and a small island for
            local UI state.
          </p>
        </div>

        <Island entry="notes.client" props={{ initialNotes, initialFilter: "all" satisfies NoteFilter }} />
      </div>
    </Layout>
  );
});

const notesRoute = new Hono().route("/", notesPage).route("/api", notesApi);

export { notesRoute };
export { notesApi };
export { noteCategories };
export type { NoteCategory };
export type { NoteFilter };
export type { NoteRecord };
export type NotesApiType = typeof notesApi;
