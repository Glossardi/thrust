# Thrust RPC + Islands Pivot Implementation Plan

Date: 2026-04-18
Related spec: `docs/superpowers/specs/2026-04-18-rpc-islands-pivot-design.md`
Status: Ready for implementation

## Objective

Refactor Thrust from HTMX-based interaction to a Bun-built islands architecture using Hono RPC, `@hono/zod-validator`, and `hono/jsx/dom`, while preserving the framework's core philosophy:

- Bun-first
- SSR-first
- minimal starter
- locality of behavior
- agent-readable code
- opt-in complexity for DB and auth

## Delivery Strategy

The implementation should be done in six ordered workstreams. Each workstream should leave the repository in a working state before the next one begins.

## Workstream 1: Runtime and dependency foundation

### Goal
Remove HTMX from the runtime and establish the new dependency/build baseline.

### Tasks
1. Remove `htmx.org` from root `package.json`.
2. Add `zod` and `@hono/zod-validator` to root `package.json`.
3. Introduce Bun-native client bundling scripts:
   - `build:client`
   - `build:client:watch`
4. Add a repo script to scan `src/features/**/*.client.tsx` and bundle them into `public/`.
5. Make the client build script a no-op when no client entries exist.
6. Keep CSS build separate from client build.
7. Ensure `bun install` produces a valid lockfile after dependency changes.

### Deliverables
- updated root dependencies
- new client build script under `scripts/`
- updated root scripts in `package.json`

### Validation
- `bun install`
- `bun run build:client`
- `bun run build:css`
- `bun run test`

## Workstream 2: Core framework primitives

### Goal
Create one official path for server-to-browser interaction.

### Tasks
1. Remove the HTMX script from `src/lib/layout.tsx`.
2. Add `src/lib/island.tsx`:
   - renders mount container
   - serializes initial props safely
   - emits `type="module"` script for a client bundle
3. Optionally add `src/lib/rpc.ts` if a small `hc()` helper improves consistency.
4. Define naming convention for emitted browser bundles:
   - one bundle per `*.client.tsx`
   - deterministic output paths under `public/`
5. Update starter comments in `src/index.tsx` and other core files to describe RPC + islands rather than HTMX.

### Deliverables
- `src/lib/island.tsx`
- optional `src/lib/rpc.ts`
- updated `src/lib/layout.tsx`
- updated `src/index.tsx`

### Validation
- client build emits browser bundles correctly
- root page still renders
- static asset serving still works

## Workstream 3: Starter architecture migration

### Goal
Make the starter itself express the new mental model clearly.

### Tasks
1. Update root `README.md` to replace HTMX language with RPC + islands.
2. Update architecture examples to show:
   - `feature.tsx`
   - `feature.client.tsx`
   - `feature.test.ts`
3. Update starter quickstart to include client builds where necessary.
4. Keep the starter visually minimal. Do not turn the starter into a demo app.
5. Decide whether to include a tiny example island in the starter or keep the starter blank and push the full example into AGENT.md.

### Recommendation
Keep the starter blank and move the detailed example into AGENT.md and TESTCASE.md. That preserves minimalism.

### Deliverables
- updated root `README.md`
- updated starter structure guidance

### Validation
- starter docs match actual file structure and scripts
- generated minimal app docs no longer mention HTMX

## Workstream 4: Agent protocol rewrite

### Goal
Teach agents one explicit, typed interaction pattern.

### Tasks
1. Rewrite Rule 2 in `AGENT.md` to "Islands Architecture and End-to-End Type Safety".
2. Replace HTMX rules with:
   - Zod schema first
   - `zValidator` on routes
   - explicit JSON status responses
   - client island with `useState`
   - RPC calls through `hc`
3. Add a complete mini example showing:
   - SSR page route
   - RPC route(s)
   - client island
   - test expectations
4. Replace HTMX pitfalls with new pitfalls:
   - no server-only imports in `*.client.tsx`
   - use explicit `c.json(..., status)`
   - set `Content-Type` correctly in tests
   - keep RPC types feature-local
   - use the standard island mount helper
5. Update `TESTCASE.md` to stress the new architecture instead of HTMX behavior.

### Deliverables
- rewritten `AGENT.md`
- updated `TESTCASE.md`

### Validation
- docs are internally consistent
- no HTMX-specific language remains
- example pattern is copyable by an agent with minimal interpretation

## Workstream 5: Scaffolder and template migration

### Goal
Make `create-thrust` generate the new architecture correctly across all variants.

### Tasks
1. Sync the root starter changes into `packages/create-thrust/template/`.
2. Update template dependencies and scripts.
3. Update template docs:
   - `README.md`
   - `AGENT.md`
   - `STATE.md`
4. Update `packages/create-thrust/bin/create-thrust.js` rewrite logic so generated apps:
   - remove HTMX references entirely
   - preserve variant-specific db/auth shaping
   - correctly rewrite docs for minimal/db/auth
5. Ensure generated minimal apps still omit db/auth dependencies and files.
6. Extend variant tests to assert client-build related behavior.
7. Extend pack test if needed for new scripts and assets.

### Deliverables
- updated template snapshot
- updated scaffolder rewrite logic
- updated variant and pack tests

### Validation
- `bun run create-thrust:variant-test`
- `bun run create-thrust:pack-test`
- scaffolded minimal app installs and builds

## Workstream 6: CI and release pipeline alignment

### Goal
Make the new architecture enforceable in automation.

### Tasks
1. Update CI to run:
   - `bun install`
   - `bun run build:client`
   - `bun run build:css`
   - `bun run test`
2. Update scaffold validation in CI to also run `build:client` inside generated apps.
3. Update publish workflow to include `build:client` and variant validation.
4. Update release docs:
   - `RELEASING.md`
   - `packages/create-thrust/PUBLISHING.md`
5. Keep npm/package publishing flow aligned with the new starter scripts.

### Deliverables
- updated CI workflow(s)
- updated release docs

### Validation
- GitHub Actions workflow definitions reflect the new build path
- root and scaffolded apps are both validated with client builds

## Recommended Implementation Order

1. Workstream 1
2. Workstream 2
3. Workstream 3
4. Workstream 4
5. Workstream 5
6. Workstream 6

This order minimizes thrash and keeps the template sync step near the end, after the root starter is stable.

## Definition of Done per Workstream

### Done means all of the following
- code and docs for the workstream are updated
- tests or validation commands pass
- `STATE.md` reflects any structural change if relevant
- no HTMX leftovers remain in the touched scope

## Global Validation Checklist

After all workstreams are complete, run:

```bash
bun install
bun run build:client
bun run build:css
bun run test
bun run create-thrust:variant-test
bun run create-thrust:pack-test
```

Then validate a fresh generated app:

```bash
node packages/create-thrust/bin/create-thrust.js /tmp/thrust-rpc-islands --no-install
cd /tmp/thrust-rpc-islands
bun install
bun run build:client
bun run build:css
bun run test
```

## Open Implementation Decisions

These should be resolved during implementation, but without reopening the overall architecture:

1. Exact client output naming under `public/`
2. Whether a small `src/lib/rpc.ts` helper is worth keeping
3. Whether the starter should include one tiny island example or stay completely blank

Recommended defaults:
- deterministic per-feature bundle names
- add `src/lib/rpc.ts` only if it clearly reduces duplication
- keep starter blank; put the main example in AGENT.md and TESTCASE.md

## Risks to Watch During Implementation

1. Accidentally importing server-only modules into `*.client.tsx`
2. Overcomplicating the client build pipeline
3. Replacing HTMX with too much browser logic instead of small islands
4. Letting docs drift from the generated template
5. Introducing one global RPC type that hurts IDE performance later

## Immediate Next Action

Start with Workstream 1:
- dependency changes
- Bun client bundling script
- no-op behavior for apps with zero islands

That foundation unlocks the rest of the migration with the lowest rework risk.
