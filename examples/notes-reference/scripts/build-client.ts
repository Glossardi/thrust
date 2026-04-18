#!/usr/bin/env bun
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const featuresDir = path.join(root, "src", "features");
const outDir = path.join(root, "public", "islands");
const watch = process.argv.includes("--watch");

function listClientEntries(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...listClientEntries(fullPath));
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".client.tsx")) {
        files.push(fullPath);
      }
    }

    return files.sort();
  } catch {
    return [];
  }
}

function snapshot(entries: string[]): string {
  return entries.map((file) => `${file}:${statSync(file).mtimeMs}`).join("|");
}

function toOutputPath(entry: string) {
  const relativePath = path.relative(featuresDir, entry).replace(/\.tsx$/, ".js");
  return path.join(outDir, relativePath);
}

async function bundleClientEntries(entries: string[]) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  if (entries.length === 0) {
    console.log("No client islands found. Skipping browser bundle.");
    return;
  }

  for (const entry of entries) {
    const outfile = toOutputPath(entry);
    mkdirSync(path.dirname(outfile), { recursive: true });

    const result = Bun.spawnSync([
      "bun",
      "build",
      entry,
      "--outfile",
      outfile,
      "--target",
      "browser",
      "--format",
      "esm"
    ], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe"
    });

    if (result.exitCode !== 0) {
      process.stdout.write(result.stdout.toString());
      process.stderr.write(result.stderr.toString());
      process.exit(result.exitCode || 1);
    }
  }

  console.log(`Built ${entries.length} client island bundle(s) into public/islands`);
}

async function buildOnce() {
  await bundleClientEntries(listClientEntries(featuresDir));
}

async function watchAndBuild() {
  console.log("Watching src/features for client island changes...");
  let lastSnapshot = "";

  while (true) {
    const entries = listClientEntries(featuresDir);
    const nextSnapshot = snapshot(entries);

    if (nextSnapshot !== lastSnapshot) {
      lastSnapshot = nextSnapshot;
      await bundleClientEntries(entries);
    }

    await Bun.sleep(500);
  }
}

if (watch) {
  await watchAndBuild();
} else {
  await buildOnce();
}
