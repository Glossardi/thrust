#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "packages", "create-thrust", "template");

const include = [
  ".gitignore",
  "AGENT.md",
  "README.md",
  "STATE.md",
  "bunfig.toml",
  "package.json",
  "src",
  "tailwind.css",
  "tsconfig.json",
];

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const rel of include) {
  cpSync(path.join(root, rel), path.join(outDir, rel), { recursive: true });
}

console.log(`Synced template to ${outDir}`);
