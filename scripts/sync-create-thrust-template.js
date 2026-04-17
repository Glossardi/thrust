#!/usr/bin/env node
import { cpSync, mkdtempSync, mkdirSync, renameSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "packages", "create-thrust", "template");
const tmpDir = mkdtempSync(path.join(os.tmpdir(), "thrust-template-"));

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

mkdirSync(tmpDir, { recursive: true });

for (const rel of include) {
  cpSync(path.join(root, rel), path.join(tmpDir, rel), { recursive: true });
}

let synced = false;
for (let attempt = 0; attempt < 5; attempt++) {
  rmSync(outDir, { recursive: true, force: true });

  try {
    renameSync(tmpDir, outDir);
    synced = true;
    break;
  } catch (error) {
    if (!error || typeof error !== "object") throw error;
    if (error.code !== "ENOTEMPTY" && error.code !== "EEXIST") throw error;
  }
}

if (!synced) {
  rmSync(tmpDir, { recursive: true, force: true });
  throw new Error(`Failed to sync template to ${outDir}`);
}

console.log(`Synced template to ${outDir}`);
