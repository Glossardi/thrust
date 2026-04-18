#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.resolve(__dirname, "..", "template");

function printHelp() {
  console.log(`create-thrust

Usage:
  create-thrust <directory> [options]

Options:
  --db          Include src/lib/db.ts
  --auth        Include src/lib/auth.ts (implies --db)
  --no-install  Skip bun install
  --force       Allow writing into an existing empty directory
  -h, --help    Show this help
`);
}

function sanitizePackageName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "thrust-app";
}

function copyDir(src, dest) {
  cpSync(src, dest, { recursive: true });
}

function updatePackageJson(appDir, opts) {
  const packagePath = path.join(appDir, "package.json");
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  pkg.name = sanitizePackageName(path.basename(appDir));
  for (const key of Object.keys(pkg.scripts)) {
    if (key.startsWith("create-thrust:")) delete pkg.scripts[key];
  }

  if (!opts.db) {
    delete pkg.dependencies["drizzle-orm"];
    delete pkg.dependencies["better-auth"];
    delete pkg.scripts["db:reset"];
  } else if (!opts.auth) {
    delete pkg.dependencies["better-auth"];
  }

  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
}

function updateReadme(appDir, opts) {
  const readmePath = path.join(appDir, "README.md");
  let readme = readFileSync(readmePath, "utf8");

  readme = readme.replace(
    /## Quickstart[\s\S]*?## Commands\n/,
    "## Quickstart\n\n```bash\nbun install\nbun run build:client\nbun run build:css\nbun dev\n```\n\nOpen [http://localhost:3000](http://localhost:3000). That's it.\n\n## Commands\n"
  );

  readme = readme.replace(/## Scaffolder variants[\s\S]*?## Architecture\n/, "## Architecture\n");

  if (!opts.db) {
    readme = readme.replace("| `bun run db:reset` | Delete and recreate the database |\n", "");
    readme = readme.replace("|  |- db.ts               # Schema + bun:sqlite connection (opt-in)\n", "");
    readme = readme.replace("|  `- auth.ts             # Better Auth (opt-in)\n", "");
    readme = readme.replace("### Want a full SaaS?\nKeep everything. Add features in `src/features/`, tables in `src/lib/db.ts`. Auth is ready via Better Auth.\n", "### Need a database or auth?\nAdd `src/lib/db.ts` for SQLite + Drizzle, and `src/lib/auth.ts` if you need authentication.\n");
    readme = readme.replace("| Database | **bun:sqlite + Drizzle ORM** | Embedded, zero setup, type-safe |\n", "");
    readme = readme.replace("| Auth | **Better Auth** | Simple, framework-agnostic |\n", "");
    readme = readme.replace(/## Database[\s\S]*?## Philosophy\n/, "## Philosophy\n");
  } else if (!opts.auth) {
    readme = readme.replace("|  `- auth.ts             # Better Auth (opt-in)\n", "");
    readme = readme.replace("### Want a full SaaS?\nKeep everything. Add features in `src/features/`, tables in `src/lib/db.ts`. Auth is ready via Better Auth.\n", "### Need auth later?\nAdd `src/lib/auth.ts` when your project needs authentication.\n");
    readme = readme.replace("| Auth | **Better Auth** | Simple, framework-agnostic |\n", "");
  }

  writeFileSync(readmePath, readme);
}

function updateState(appDir, opts) {
  const statePath = path.join(appDir, "STATE.md");
  let state = readFileSync(statePath, "utf8");

  if (!opts.db) {
    state = state.replace("- *(none yet - add tables in `src/lib/db.ts`)*", "- *(none yet - add `src/lib/db.ts` if your app needs a database)*");
    state = state.replace("- `src/lib/db.ts` - Database connection + schema (opt-in)\n", "");
    state = state.replace("- `src/lib/auth.ts` - Better Auth config (opt-in)\n", "");
  } else if (!opts.auth) {
    state = state.replace("- `src/lib/auth.ts` - Better Auth config (opt-in)\n", "");
  }

  writeFileSync(statePath, state);
}

function removeOptionalFiles(appDir, opts) {
  const dbPath = path.join(appDir, "src", "lib", "db.ts");
  const authPath = path.join(appDir, "src", "lib", "auth.ts");

  if (!opts.db && existsSync(dbPath)) unlinkSync(dbPath);
  if (!opts.auth && existsSync(authPath)) unlinkSync(authPath);
}

function detectBun() {
  const result = spawnSync("bun", ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const targetArg = args.find((arg) => !arg.startsWith("-"));
  if (!targetArg) {
    printHelp();
    process.exit(1);
  }

  const opts = {
    db: args.includes("--db") || args.includes("--auth"),
    auth: args.includes("--auth"),
    install: !args.includes("--no-install"),
    force: args.includes("--force"),
  };

  const appDir = path.resolve(process.cwd(), targetArg);

  if (!existsSync(templateDir)) {
    console.error("Template directory not found. Run the sync script before testing locally.");
    process.exit(1);
  }

  if (existsSync(appDir)) {
    const files = readdirSync(appDir);
    if (files.length > 0 || !opts.force) {
      console.error(`Target directory is not empty: ${appDir}`);
      console.error("Use a new directory, or pass --force for an existing empty directory.");
      process.exit(1);
    }
  } else {
    mkdirSync(appDir, { recursive: true });
  }

  copyDir(templateDir, appDir);
  removeOptionalFiles(appDir, opts);
  updatePackageJson(appDir, opts);
  updateReadme(appDir, opts);
  updateState(appDir, opts);

  console.log(`Created Thrust app in ${appDir}`);
  console.log(`Variant: ${opts.auth ? "auth" : opts.db ? "db" : "minimal"}`);

  if (opts.install) {
    if (detectBun()) {
      console.log("Running bun install...");
      const result = spawnSync("bun", ["install"], { cwd: appDir, stdio: "inherit" });
      if (result.status !== 0) process.exit(result.status ?? 1);
    } else {
      console.log("Skipping install: Bun not found. Run 'bun install' manually.");
    }
  }

  console.log("\nNext steps:");
  console.log(`  cd ${targetArg}`);
  if (!opts.install) console.log("  bun install");
  console.log("  bun run build:client");
  console.log("  bun run build:css");
  console.log("  bun dev");
}

main();
