# Thrust Roadmap

## Phase 1 - Publicly usable

Goal: Make Thrust easy to trust, install, run, and contribute to.

### Deliverables
- `create-thrust` scaffolder
- GitHub Actions CI
- Contribution docs
- Issue / PR templates
- typed RPC + islands architecture
- One minimal reference app

### Exit criteria
- A new user can clone or scaffold a project and get to a running app in minutes
- Every PR runs install, CSS build, tests, and a server smoke test automatically
- Contributors know what belongs in core vs docs vs examples

## Phase 2 - Large-repo ready

Goal: Keep Thrust understandable for coding agents as projects grow.

### Deliverables
- Official feature scaling rules (`file -> folder` when needed)
- Shared infra patterns (`env`, `errors`, `icons`, `logger`)
- Context scaling guidance (`STATE.md`, `FEATURE.md`, `ARCHITECTURE.md`)
- Async patterns (polling, SSE, status lifecycles)
- One complex reference app

### Exit criteria
- Large features have a documented path without breaking Thrust's locality principles
- Shared code has predictable placement
- Async / long-running flows are documented and repeatable

## Phase 3 - Ecosystem ready

Goal: Make Thrust feel like a serious framework, not just a starter template.

### Deliverables
- Docs site
- Versioning and release discipline
- Agent benchmark suite
- Core vs module boundary
- Multiple reference apps

### Exit criteria
- Thrust has repeatable releases, public docs, and measurable framework quality
- New users can evaluate whether it fits their use case quickly

## Near-term priorities
1. typed RPC + islands pivot
2. CI alignment for client bundles
3. Contribution docs
4. `create-thrust`
5. Minimal reference app
