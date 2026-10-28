# Changelog

All notable changes to Age of Legends are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Playable prototype, phases 1–4

The self-contained prototype under `playable/` grew from a single core-loop slice into a complete
client-side game loop. Everything runs in the browser with no build step, no server and no external
assets; online play, monetization and art are simulated locally.

**Phase 1 — MVP**

- Heroes as a system: three original factions (Dawnward Pact, Wildkin Circle, Duskbound Covenant),
  team synergy tiers (2 → +8%, 3 → +14%, 4 → +20%), a basic/passive/ultimate skill trio per hero
  and a hero detail screen. Passive modifiers feed the real stat calculation.
- Formation v1: front and back lines, honored by the battle resolver.
- City build queue with a limited number of builders, shown as a strip over the kingdom.
- Campaign chapter "The Ironvale Marches" — 12 stages with three bosses — plus idle rewards
  (8-hour accrual cap) and stage sweep.
- Scripted first-time user experience: four guided steps, a free rare hero and a first-victory
  bonus.
- Daily engagement: a seven-day login track, five rotating missions and an activity meter with
  three reward chests.

**Phase 2 — Alpha**

- Hero summon (gacha) with published odds (3% legendary, 12% epic, 30% rare, 55% common), pity at
  10 pulls for epic and 60 for legendary, and shards awarded for duplicates.
- Star ascension up to 6★, four equipment slots (weapon, armor, boots, trinket), an inventory and
  gear drops from combat.
- Multi-slot saves: three independent slots, export/import, and migration of legacy saves.

**Phase 3 — Beta**

- Asynchronous arena PvP: a seeded ladder across five leagues (Bronze through Diamond), rating and
  a daily attempt allowance.
- Guild: donations, guild coins, a shop, a roster, and three research techs (Might, Vigor,
  Prosperity) whose bonuses apply to real stats and production.
- Eight achievements with claimable rewards.

**Phase 4 — Soft launch**

- Shop with a daily gift and three bundles.
- Season pass across ten tiers, with a free and a premium track.
- Four rotating live events: Bounty Weekend, Gold Rush, Arena Fervor and Fate Festival.

**Presentation and structure**

- Rendered battle scene replacing the earlier card-and-emoji combat: drawn characters, ATB and
  energy, role ultimates, projectiles, area effects, healing, floating damage, screen shake,
  hitstop, particles and speed controls.
- Synthesized audio with no asset files — sound effects, a music loop and a persisted mute
  setting — degrading to silence where the Web Audio API is unavailable.
- Procedural hero portraits drawn on canvas (original art, no imported assets).
- The kingdom rebuilt as a living island world.
- The prototype monolith split into modules under the `AOL` namespace: `data.js`, `art.js`,
  `audio.js`, `render.js`, `battle.js` and `game.js`.
- Asset cache-busting so prototype updates always load in the browser.
- Root launchers (`JOGAR - Age of Legends.html` and `.bat`) that open the prototype directly.

### Added — Foundation

- Monorepo foundation: pnpm workspaces, Turborepo, TypeScript project references, ESLint (flat
  config), Prettier and EditorConfig.
- Containerized local infrastructure via Docker Compose (PostgreSQL 17, Redis 7).
- Complete documentation set: game vision, Game Design Document, architecture overview,
  engineering standards, roadmap and initial Architecture Decision Records.
- Reference study notes separating engineering inspiration from gameplay inspiration and recording
  the original adaptations made for Age of Legends.
- `shared` package: branded ID types, deterministic math (vectors, scalars, seeded RNG, hashing),
  global constants, the versioned client/server protocol and its validation schemas, with unit
  tests.
- Buildable skeletons for the `engine`, `game`, `server` and `client` packages.
- Continuous integration workflows and contribution templates.
- Self-contained, no-build playable prototype under `playable/` demonstrating the core loop
  (resource production, Town-Hall-gated kingdom upgrades, procedural world with fog of war,
  gathering and PvE camp battles) with a deterministic seeded RNG and fixed-timestep loop.
- Reference study notes enriched with concrete observations from the engineering and gameplay
  references, each mapped to an original Age of Legends system.
- Mobile and live-service strategy: ADR-0008 (Capacitor packaging for Google Play) and ADR-0009
  (live-service platform — telemetry, ethical server-validated IAP, remote configuration and
  incremental content delivery), with architecture documents and roadmap milestones M9–M10.
- Design direction review under `docs/design-review/`: executive verdict, critical audit, genre
  teardown, system-by-system gap analysis and a six-phase build roadmap.

### Added — Testing

- `pnpm run smoke:playable` — a headless smoke test (`playable/smoke-test.cjs`) that boots the
  prototype with DOM and canvas stubs and asserts the prototype's systems, so the browser-only
  slice is covered by the same quality gate as the typed packages.

### Changed — Toolchain

- GitHub Actions updated to `actions/checkout@v7` and `actions/setup-node@v6`, clearing the
  Node.js 20 deprecation warning that every workflow run emitted.
- Production dependencies updated as a group.
- TypeScript held at the 6.x line and `@types/node` held at the 22.x line, with matching `ignore`
  rules in `.github/dependabot.yml`. See
  [ADR-0010](docs/adr/0010-typescript-version-ceiling.md) for the constraint and the conditions
  for lifting it.

### Verified

- `pnpm run check` passes: format, lint across five workspaces, typecheck across eight tasks and
  59 tests in shared, engine, game and server. Every package builds, including the client under
  Vite 8.
- `pnpm run smoke:playable` passes its 17 assertions.

## [0.1.0] — Foundation

Initial repository scaffolding. Establishes the engineering baseline for milestone-based
development. No player-facing gameplay yet.
