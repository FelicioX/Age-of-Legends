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
- [x] Install toolchain (Node 22 + pnpm) and verify `pnpm run check`
- [x] Publish the repository to GitHub

### Open

- [ ] Configure branch protection on `main` (required status checks, no direct pushes)
- [ ] Decide the repository's visibility — it is currently public

## Prototype track — `playable/`

A client-side track that validates game design ahead of the typed packages. It runs in the browser
with no build step and simulates online play, monetization and art locally.

### Done

- [x] Phase 1 (MVP) — hero factions and synergy, per-hero skills, formation, build queue,
      campaign chapter with idle rewards and sweep, scripted FTUE, daily login and missions
- [x] Phase 2 (Alpha) — summon with published odds and pity, star ascension, equipment and
      inventory, multi-slot saves with export/import
- [x] Phase 3 (Beta) — asynchronous arena PvP with leagues, guild with research techs,
      achievements
- [x] Phase 4 (Soft launch) — shop, season pass, rotating events
- [x] Rendered battle scene, synthesized audio, procedural hero portraits, island world
- [x] Headless smoke test in the quality gate (`pnpm run smoke:playable`)

### Open

- [ ] Premium design system pass: UI kit, icons and visual effects
- [ ] Close the architectural split — fold prototype systems into `game/` and `engine/` so the
      typed packages own the rules

> Phases 5–6 (scale, localization and multi-year LiveOps) need a real server and infrastructure
> and are out of scope for a client-side prototype.

## Milestone 1 — Simulation Core (next)

- [ ] ECS world container and archetype/component storage
- [ ] System scheduler and fixed-step loop
- [ ] Seeded, deterministic RNG integrated into the world
- [ ] Golden-master determinism tests
- [ ] `game` bootstrap: first components and a movement system

> Task status is kept in sync with the roadmap. Completed milestone tasks are archived into the
> [CHANGELOG](CHANGELOG.md).
