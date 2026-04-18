import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const noteCategories = ["general", "work", "personal"] as const;
export type NoteCategory = typeof noteCategories[number];

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  category: text("category").$type<NoteCategory>().notNull().default("general"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type NoteRecord = typeof notes.$inferSelect;

mkdirSync("data", { recursive: true });
const sqlite = new Database("data/app.db", { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general',
    pinned INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite);
