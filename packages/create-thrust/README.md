# create-thrust

Scaffold a new Thrust app.

## Usage

Published usage:

```bash
bunx create-thrust my-app
```

Local development usage from this repository:

```bash
node packages/create-thrust/bin/create-thrust.js my-app
```

Options:
- `--db` include `src/lib/db.ts`
- `--auth` include `src/lib/auth.ts` (implies `--db`)
- `--no-install` skip `bun install`
- `--force` allow writing into an existing empty target directory

Examples:

```bash
bunx create-thrust my-app
bunx create-thrust my-app --db
bunx create-thrust my-app --auth
```
