import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Schema
// Define your tables here. Example:
//
// export const posts = sqliteTable("posts", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   title: text("title").notNull(),
//   content: text("content").notNull().default(""),
//   createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
// });

// Connection
mkdirSync("data", { recursive: true });
const sqlite = new Database("data/app.db", { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite);

// Auto-migrate
// Add CREATE TABLE IF NOT EXISTS for each table above.
// These are idempotent and run on every app start.
// Example:
//
// sqlite.exec(`
//   CREATE TABLE IF NOT EXISTS posts (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     content TEXT NOT NULL DEFAULT '',
//     createdAt TEXT NOT NULL
//   );
// `);
