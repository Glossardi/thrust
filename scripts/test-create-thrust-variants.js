#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const cliPath = path.join(root, "packages", "create-thrust", "bin", "create-thrust.js");
const tmpRoot = mkdtempSync(path.join(os.tmpdir(), "create-thrust-variants-"));

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

function scaffold(name, flags = []) {
  const dir = path.join(tmpRoot, name);
  run("node", [cliPath, dir, ...flags, "--no-install"], root);
  return dir;
}

function checkNoInternalScripts(pkg) {
  for (const key of Object.keys(pkg.scripts ?? {})) {
    assert(!key.startsWith("create-thrust:"), `Generated app still contains internal script: ${key}`);
  }
}

function checkCommon(dir, expectedName) {
  const pkg = readJson(path.join(dir, "package.json"));
  const readme = readFileSync(path.join(dir, "README.md"), "utf8");

  assert(pkg.name === expectedName, `Unexpected package name for ${expectedName}: ${pkg.name}`);
  assert(existsSync(path.join(dir, ".gitignore")), `Missing .gitignore in ${expectedName}`);
  assert(!existsSync(path.join(dir, "bun.lock")), `Generated app should not include bun.lock: ${expectedName}`);
  assert(existsSync(path.join(dir, "scripts", "build-client.ts")), `Generated app is missing scripts/build-client.ts: ${expectedName}`);
  assert(existsSync(path.join(dir, "scripts", "dev.ts")), `Generated app is missing scripts/dev.ts: ${expectedName}`);
  assert(!readme.includes("## Scaffolder variants"), `Generated README still includes scaffolder section: ${expectedName}`);
  assert(readme.includes("bun install\nbun run build:client\nbun run build:css\nbun dev"), `Generated README quickstart was not rewritten: ${expectedName}`);
  assert("build:client" in (pkg.scripts ?? {}), `Generated app is missing build:client: ${expectedName}`);
  assert("build:client:watch" in (pkg.scripts ?? {}), `Generated app is missing build:client:watch: ${expectedName}`);
  checkNoInternalScripts(pkg);

  return { pkg, readme };
}

run("node", [path.join(root, "scripts", "sync-create-thrust-template.js")], root);

const minimalDir = scaffold("minimal-app");
const dbDir = scaffold("db-app", ["--db"]);
const authDir = scaffold("auth-app", ["--auth"]);

const minimal = checkCommon(minimalDir, "minimal-app");
assert(!existsSync(path.join(minimalDir, "src", "lib", "db.ts")), "Minimal variant should not include src/lib/db.ts");
assert(!existsSync(path.join(minimalDir, "src", "lib", "auth.ts")), "Minimal variant should not include src/lib/auth.ts");
assert(!("drizzle-orm" in (minimal.pkg.dependencies ?? {})), "Minimal variant should not depend on drizzle-orm");
assert(!("better-auth" in (minimal.pkg.dependencies ?? {})), "Minimal variant should not depend on better-auth");
assert(!("db:reset" in (minimal.pkg.scripts ?? {})), "Minimal variant should not include db:reset");
assert(!minimal.readme.includes("## Database"), "Minimal variant README should not include Database section");
assert(!minimal.readme.includes("| Database | **bun:sqlite + Drizzle ORM** | Embedded, zero setup, type-safe |"), "Minimal variant README should not include Database tech stack row");
assert(!minimal.readme.includes("| Auth | **Better Auth** | Simple, framework-agnostic |"), "Minimal variant README should not include Auth tech stack row");
assert(minimal.readme.includes("Add `src/lib/db.ts` and `src/lib/auth.ts` later if your app needs persistence or authentication"), "Minimal variant README should explain how to add db/auth later");

const db = checkCommon(dbDir, "db-app");
assert(existsSync(path.join(dbDir, "src", "lib", "db.ts")), "DB variant should include src/lib/db.ts");
assert(!existsSync(path.join(dbDir, "src", "lib", "auth.ts")), "DB variant should not include src/lib/auth.ts");
assert("drizzle-orm" in (db.pkg.dependencies ?? {}), "DB variant should depend on drizzle-orm");
assert(!("better-auth" in (db.pkg.dependencies ?? {})), "DB variant should not depend on better-auth");
assert("db:reset" in (db.pkg.scripts ?? {}), "DB variant should include db:reset");
assert(!db.readme.includes("| Auth | **Better Auth** | Simple, framework-agnostic |"), "DB variant README should not include Auth row");

const auth = checkCommon(authDir, "auth-app");
assert(existsSync(path.join(authDir, "src", "lib", "db.ts")), "Auth variant should include src/lib/db.ts");
assert(existsSync(path.join(authDir, "src", "lib", "auth.ts")), "Auth variant should include src/lib/auth.ts");
assert("drizzle-orm" in (auth.pkg.dependencies ?? {}), "Auth variant should depend on drizzle-orm");
assert("better-auth" in (auth.pkg.dependencies ?? {}), "Auth variant should depend on better-auth");
assert("db:reset" in (auth.pkg.scripts ?? {}), "Auth variant should include db:reset");
assert(auth.readme.includes("## Database"), "Auth variant README should include Database section");

rmSync(tmpRoot, { recursive: true, force: true });
console.log("create-thrust variant test passed");
