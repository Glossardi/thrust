import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Schema ──────────────────────────────────────────────
// Define your tables here. This file is imported by both
// the app (via db.ts) and drizzle-kit (via drizzle.config.ts).
// Keep it free of runtime imports like bun:sqlite.
//
// Example:
// export const posts = sqliteTable("posts", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   title: text("title").notNull(),
//   content: text("content").notNull().default(""),
//   createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
// });
