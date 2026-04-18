# Thrust RPC + Islands Pivot Design

Date: 2026-04-18
Status: Approved in chat, pending written-spec review
Owner: Thrust maintainers

## Summary

Thrust will remove HTMX and replace it with a stricter interactivity model built on:

- server-rendered Hono pages
- typed JSON RPC routes via Hono RPC (`hc`)
- request validation via `@hono/zod-validator`
- small browser-side islands via `hono/jsx/dom`
- local UI state via Hono JSX hooks such as `useState`
- Bun-based client bundling for `*.client.tsx` entrypoints

The goal is to make Thrust substantially more reliable for AI coding agents by moving interaction failures from runtime DOM behavior into explicit TypeScript, validation, and build-time contracts.

## Problem

HTMX has proven too implicit for agent-driven development in Thrust.

Observed failure modes:

- wrong `hx-target` and `hx-swap` behavior
- lost UI state after partial DOM replacement
- event behavior that only fails in the browser
- hard-to-debug behavior because client/server contracts are encoded in HTML attributes instead of typed APIs

For humans, these issues are often manageable. For coding agents, they create too many invisible runtime traps.

## Goals

1. Remove HTMX entirely from the framework, starter, scaffolder, and docs.
2. Keep Thrust SSR-first and Bun-first.
3. Keep locality of behavior as a core design rule.
4. Make interactive behavior explicit, typed, and testable.
5. Keep the default stack minimal and professional.
6. Preserve opt-in complexity for DB and auth.
7. Ensure the starter and `create-thrust` generate the new architecture consistently.

## Non-goals

1. Thrust does not become a SPA framework.
2. Thrust does not introduce a client router.
3. Thrust does not add external state libraries.
4. Thrust does not move to Vite, Next.js, or React.
5. Thrust does not require hydration for the whole page.

## Chosen Architecture

## 1. Rendering model

Thrust will remain server-rendered by default.

- page routes return HTML via Hono JSX
- interactive subtrees are mounted as client islands
- only interactive parts load browser-side code

This preserves the current SSR-first philosophy while making interactivity explicit.

## 2. Interaction model

Interactive UI uses typed JSON RPC, not HTML fragment swapping.

- SSR route renders page and mount points
- RPC routes return `c.json(..., status)` with explicit status codes
- client islands call RPC routes with `hc`
- island state lives in `useState` and related hooks

This is a deliberate shift away from HTML-over-the-wire as the interactivity contract.

## 3. Feature structure

The approved feature structure is a co-located dual-file slice:

```text
src/features/
|- notes.tsx           # SSR page + RPC routes + schemas
|- notes.client.tsx    # browser-only island
`- notes.test.ts       # tests
```

This preserves locality of behavior while creating a hard, readable boundary between server and browser code.

`notes.tsx` and `notes.client.tsx` are treated as one feature slice, not two unrelated modules.

## 4. RPC contract

RPC routes must be typed and explicit.

Rules:

- validate request inputs with `@hono/zod-validator`
- use explicit `c.json(data, status)` responses
- do not rely on `c.notFound()` for typed RPC behavior unless a typed not-found contract is intentionally defined
- prefer feature-local exported route types such as `type NotesApiType = typeof notesApi`

We prefer feature-local RPC types instead of a single global monster client to keep IDE performance and large-repo scaling under control.

## 5. Island mounting

Thrust will add a standard island mount primitive.

Recommended shape:

- server helper in `src/lib/island.tsx`
- emits a container element
- serializes initial props safely
- loads the corresponding browser bundle with a `type="module"` script

This is important because it prevents every feature or every agent from inventing its own mount protocol.

## 6. State management

Only local UI state is allowed inside the client island.

Allowed:

- `useState`
- `useReducer`
- `useEffect`
- optimistic local state if it remains feature-local and simple

Disallowed by default:

- external state libraries
- DOM-as-state patterns
- cross-page global state systems

## Build System Design

## 1. Client bundling

A small Bun-based client build step will bundle all `*.client.tsx` files into browser assets under `public/`.

Requirements:

- zero additional heavy frontend toolchain
- works in minimal starter and scaffolded apps
- no-op when no `*.client.tsx` files exist
- watch mode available during development

Planned scripts:

- `build:client`
- `build:client:watch`

## 2. Development workflow

Development will need three moving pieces:

- server watch
- CSS build/watch
- client build/watch

The exact script shape can remain minimal, but the result must be one obvious development path for users and agents.

## Library and Dependency Changes

## Remove

- `htmx.org`
- HTMX script tag from layout
- HTMX guidance from docs and tests

## Add

- `zod`
- `@hono/zod-validator`

Hono remains the core runtime/UI/server library. `hono/jsx/dom` and `hono/client` come from the existing Hono dependency.

## Framework File Changes

## Core runtime

Likely touched files:

- `package.json`
- `src/lib/layout.tsx`
- `src/index.tsx`
- `src/lib/island.tsx` (new)
- optional `src/lib/rpc.ts` (new)

## Docs and protocol

Likely touched files:

- `README.md`
- `AGENT.md`
- `STATE.md`
- `TESTCASE.md`
- `ROADMAP.md`
- `CONTRIBUTING.md`
- `RELEASING.md`

## Scaffolder

Likely touched files:

- `packages/create-thrust/bin/create-thrust.js`
- `packages/create-thrust/template/**`
- `scripts/sync-create-thrust-template.js`
- scaffold validation scripts
- CI workflows

## AGENT.md Rewrite Requirements

AGENT.md will be rewritten around the new rule:

"Islands Architecture and End-to-End Type Safety"

It must explicitly teach agents how to:

1. define a Zod schema
2. validate a route with `zValidator`
3. write an SSR route that renders layout and an island mount
4. write an RPC route returning typed JSON
5. write a `*.client.tsx` island using `hc` and `useState`
6. handle errors with explicit JSON status codes
7. test JSON/form requests correctly with the required headers

AGENT.md should include a concrete mini-example, not only abstract advice.

## Public Documentation Changes

README and framework docs will change in the following ways:

- HTMX is removed from the tech stack
- interactivity is described as "typed RPC + small islands"
- architecture examples reflect `*.client.tsx`
- quickstart includes client bundle build steps where required

The messaging should remain professional, minimal, and agent-first.

## Test and Validation Strategy

## 1. Framework validation

The root framework should validate:

- CSS build
- client build
- server tests
- server smoke test

## 2. Scaffolder validation

Generated apps should validate:

- install
- CSS build
- client build
- tests
- tarball pack test
- variant checks for minimal, db, auth

## 3. Contract validation

The new system is considered successful if the common failure class moves from browser-only DOM behavior to:

- TypeScript errors
- validator failures
- test failures
- predictable JSON response handling

## Migration Strategy

Implementation should proceed in the following order:

1. establish build/runtime primitives
2. remove HTMX from core starter
3. add island mount helper and RPC conventions
4. refactor docs and AGENT protocol
5. update scaffolder template and rewrite logic
6. update CI and quality checks

This order keeps the system buildable while the public documentation catches up.

## Risks and Mitigations

## Risk 1: accidental frontend complexity creep

Mitigation:

- keep islands small
- no SPA features
- no global client state system
- no client router

## Risk 2: client bundling becomes noisy or fragile

Mitigation:

- Bun-native build script only
- no-op behavior when no islands exist
- one standard asset layout

## Risk 3: server/browser boundaries become confusing

Mitigation:

- strict `*.client.tsx` convention
- explicit AGENT.md anti-patterns
- standard mount helper

## Risk 4: RPC typing slows IDEs in larger apps

Mitigation:

- feature-local RPC types
- avoid exporting one global mega-client for all routes

## Risk 5: documentation drift between root starter and scaffolder template

Mitigation:

- update sync pipeline
- extend scaffold tests to validate new scripts and docs

## Exit Criteria

This pivot is complete when:

1. HTMX is fully removed from runtime, dependencies, docs, and generated apps.
2. The starter exposes one documented interactivity path: SSR pages plus typed RPC islands.
3. AGENT.md documents the new architecture clearly with a concrete example.
4. The scaffolder produces minimal, db, and auth variants using the new architecture.
5. CI validates server build, client build, scaffold variants, and pack tests.
6. Thrust's public positioning remains minimal, Bun-first, SSR-first, and agent-readable.

## Implementation Roadmap

### Phase 1: Build and runtime foundation
- add `zod` and `@hono/zod-validator`
- remove HTMX dependency and layout script
- add Bun client bundle script(s)
- define `public/` output path for islands

### Phase 2: Framework primitives
- add `src/lib/island.tsx`
- optionally add `src/lib/rpc.ts`
- define naming and mount conventions for `*.client.tsx`

### Phase 3: Starter refactor
- update root starter code
- update starter docs and examples
- ensure starter remains minimal

### Phase 4: Agent protocol rewrite
- rewrite AGENT.md around RPC + islands
- replace HTMX-specific pitfalls with RPC/island pitfalls
- provide a concrete feature blueprint

### Phase 5: Scaffolder migration
- sync updated template
- update `create-thrust` rewrite logic
- extend variant tests
- extend pack tests if needed

### Phase 6: CI and release discipline
- validate `build:client` in CI
- validate scaffolded apps with client bundle builds
- keep publish and release docs aligned

## Final Recommendation

Proceed with the pivot using co-located server/client feature slices, typed JSON RPC, Hono client islands, and a Bun-native bundle step.

This is the best available path to preserve Thrust's philosophy while materially increasing reliability for AI-coding-agent workflows.
