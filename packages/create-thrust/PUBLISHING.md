# Publishing create-thrust

## Pre-flight checklist

Run from the repo root:

```bash
bun run create-thrust:sync
bun run test
bun run build:css
```

Then validate the package tarball:

```bash
bun run create-thrust:pack-test
```

## Publish

From `packages/create-thrust/`:

```bash
npm publish --access public
```

## Post-publish checks

```bash
bunx create-thrust@latest thrust-smoke --no-install
cd thrust-smoke
bun install
bun run build:css
bun run test
```

## Versioning

- bump `packages/create-thrust/package.json`
- keep the template synced before publishing
- only publish when CI is green
