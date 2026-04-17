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
bun run build:css
bun run test
bun dev
```

## Before opening a PR

Please make sure:
- tests pass
- CSS builds successfully
- docs are updated when behavior changes
- `STATE.md` is updated if routes, tables, or starter structure changed

## Pull request guidelines

- Keep PRs focused
- Explain why the change is generally useful
- Prefer the smallest change that solves the problem
- Include user-facing impact in the PR description

## Framework quality bar

A good change should improve at least one of these:
- first-run experience
- coding-agent reliability
- large-repo scalability
- documentation clarity
- test / CI confidence
