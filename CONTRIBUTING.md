# Contributing to Thrust

Thanks for contributing.

## What Thrust optimizes for

Thrust is built for:
- low-context development
- coding-agent-friendly structure
- SSR-first apps
- minimal runtime and architectural drag

When contributing, prefer changes that improve:
- clarity
- determinism
- testability
- installability
- agent readability

Avoid changes that add abstraction without clear payoff.

## Core principles

- Keep the starter minimal
- Prefer explicit code over magic
- Make the default path work well
- Keep optional complexity opt-in
- Document every new pattern clearly

## What belongs in core

Good candidates for core:
- starter structure
- shared layout / infra patterns
- test defaults
- docs for agent-safe patterns
- clearly reusable runtime helpers

Bad candidates for core:
- app-specific UI components
- vendor-specific integrations
- heavy plugin systems
- speculative abstractions
- features that most users do not need on day one

## Development

```bash
bun install
bun run build:client
bun run build:css
bun run test
bun dev
```

## If you change the starter template

The scaffolder package contains a snapshot of the root starter in `packages/create-thrust/template/`.
After changing starter files, run:

```bash
bun run create-thrust:sync
```

## Before opening a PR

Please make sure:
- tests pass
- client bundles build successfully
- CSS builds successfully
- scaffolder checks pass (`bun run create-thrust:variant-test` and `bun run create-thrust:pack-test` when relevant)
- docs are updated when behavior changes
- `STATE.md` is updated if routes, tables, or starter structure changed

## Pull request guidelines

- Keep PRs focused
- Explain why the change is generally useful
- Prefer the smallest change that solves the problem
- Include user-facing impact in the PR description
- Use plain-text, professional commit subjects without decorative emoji

## Framework quality bar

A good change should improve at least one of these:
- first-run experience
- coding-agent reliability
- large-repo scalability
- documentation clarity
- test / CI confidence
