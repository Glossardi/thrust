#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const pkgDir = path.join(root, "packages", "create-thrust");
const tmpRoot = mkdtempSync(path.join(os.tmpdir(), "create-thrust-pack-"));
const appDir = path.join(tmpRoot, "app");

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("node", [path.join(root, "scripts", "sync-create-thrust-template.js")], root);

const pack = spawnSync("npm", ["pack"], { cwd: pkgDir, encoding: "utf8" });
if (pack.status !== 0) {
  process.stdout.write(pack.stdout || "");
  process.stderr.write(pack.stderr || "");
  process.exit(pack.status ?? 1);
}

const tarball = (pack.stdout || "").trim().split("\n").pop()?.trim();
if (!tarball) {
  console.error("Failed to determine tarball name from npm pack output.");
  process.exit(1);
}

const tarballPath = path.join(pkgDir, tarball);
if (!existsSync(tarballPath)) {
  console.error(`Tarball not found: ${tarballPath}`);
  process.exit(1);
}

run("bun", ["add", "-d", tarballPath], tmpRoot);
run(path.join(tmpRoot, "node_modules", ".bin", "create-thrust"), [appDir, "--no-install"], tmpRoot);

const generatedPkg = JSON.parse(readFileSync(path.join(appDir, "package.json"), "utf8"));
const generatedReadme = readFileSync(path.join(appDir, "README.md"), "utf8");

if (generatedPkg.name !== "app") {
  console.error(`Unexpected generated package name: ${generatedPkg.name}`);
  process.exit(1);
}
for (const key of Object.keys(generatedPkg.scripts ?? {})) {
  if (key.startsWith("create-thrust:")) {
    console.error(`Generated app still contains internal script: ${key}`);
    process.exit(1);
  }
}
if (!existsSync(path.join(appDir, ".gitignore"))) {
  console.error("Generated app is missing .gitignore");
  process.exit(1);
}
if (!existsSync(path.join(appDir, "scripts", "build-client.ts"))) {
  console.error("Generated app is missing scripts/build-client.ts");
  process.exit(1);
}
if (existsSync(path.join(appDir, "bun.lock"))) {
  console.error("Generated app should not include bun.lock");
  process.exit(1);
}
if (!existsSync(path.join(appDir, "src", "index.tsx"))) {
  console.error("Generated app is missing src/index.tsx");
  process.exit(1);
}
if (!existsSync(path.join(appDir, "README.md"))) {
  console.error("Generated app is missing README.md");
  process.exit(1);
}
if (!("build:client" in (generatedPkg.scripts ?? {}))) {
  console.error("Generated app is missing build:client script");
  process.exit(1);
}
if (generatedReadme.includes("## Scaffolder variants")) {
  console.error("Generated README still includes scaffolder documentation");
  process.exit(1);
}
if (generatedReadme.includes("## Official reference app")) {
  console.error("Generated README still includes reference app documentation");
  process.exit(1);
}

rmSync(tarballPath, { force: true });
rmSync(tmpRoot, { recursive: true, force: true });
console.log("create-thrust pack test passed");
