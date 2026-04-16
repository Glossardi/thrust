import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";

// Re-export all schemas so features can import from db.ts
export * from "./schema";

// ── Connection ──────────────────────────────────────────
mkdirSync("data", { recursive: true });
const sqlite = new Database("data/app.db", { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite);

// ── Auto-migrate (dev convenience) ──────────────────────
// Add CREATE TABLE IF NOT EXISTS statements here when you add tables.
// These run on every app start and are safe to re-run (idempotent).
// Example:
// sqlite.exec(`
//   CREATE TABLE IF NOT EXISTS posts (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     content TEXT NOT NULL DEFAULT '',
//     createdAt TEXT NOT NULL
//   );
// `);
