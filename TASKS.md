# Tasks

Active, near-term task tracking. Strategic planning lives in
[ROADMAP.md](ROADMAP.md); the full backlog lives in
[docs/roadmap/Backlog.md](docs/roadmap/Backlog.md).

## Milestone 0 — Foundation

### Done

- [x] Initialize monorepo (pnpm workspaces, Turborepo)
- [x] Root tooling: TypeScript, ESLint, Prettier, EditorConfig
- [x] Local infrastructure via Docker Compose (PostgreSQL, Redis)
- [x] Documentation set: vision, GDD, architecture, standards, ADRs
- [x] Reference study notes (engineering + gameplay)
- [x] `shared` domain core with unit tests
- [x] Package skeletons: engine, game, server, client
- [x] CI workflows and contribution templates

### In progress

- [ ] Install toolchain (Node 22 + pnpm) and verify `pnpm run check`
- [ ] Publish repository to GitHub and configure branch protection

## Milestone 1 — Simulation Core (next)

- [ ] ECS world container and archetype/component storage
- [ ] System scheduler and fixed-step loop
- [ ] Seeded, deterministic RNG integrated into the world
- [ ] Golden-master determinism tests
- [ ] `game` bootstrap: first components and a movement system

> Task status is kept in sync with the roadmap. Completed milestone tasks are archived into the
> [CHANGELOG](CHANGELOG.md).
