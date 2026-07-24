# Milestones

Each milestone lists its objective, key deliverables and acceptance criteria. A milestone is
complete only when all acceptance criteria pass and documentation is updated.

## M0 — Foundation & Documentation ⬅ current

**Objective:** a professional engineering baseline before gameplay code.

Deliverables:

- Monorepo (pnpm + Turborepo), TypeScript project references, lint/format, CI, Docker infra.
- Full documentation set: vision, GDD, architecture, standards, ADRs.
- `shared` domain core (types, math, constants, protocol, validation) with tests.
- Buildable skeletons for engine, game, server, client.

Acceptance:

- `pnpm run check` passes (format, lint, typecheck, tests).
- Documentation complete and internally linked.
- Repository published and protected.

## M1 — Simulation Core (ECS)

**Objective:** a deterministic ECS able to run gameplay headlessly.

Deliverables: world container, component storage, queries, system scheduler, fixed-step loop,
seeded RNG, first `game` components/systems (movement).

Acceptance: golden-master determinism tests pass; a scripted scenario runs headlessly with stable
output; coverage targets met for core logic.

## M2 — Authoritative Networking

**Objective:** a player moves in a shared, server-authoritative world.

Deliverables: WebSocket gateway, intent/snapshot protocol, validation, interest management, client
prediction and reconciliation, binary serialization.

Acceptance: two clients see each other move with correct authority; prediction/reconciliation
verified; protocol validated and versioned.

## M3 — Kingdom Building & Resources

**Objective:** build and grow a persistent kingdom.

Deliverables: town hall and core buildings, the five resources, production and build/upgrade timers,
storage, kingdom persistence.

Acceptance: a kingdom persists across sessions; production and upgrades behave per design; economy
sinks/faucets instrumented.

## M4 — Heroes, Combat & PvE

**Objective:** recruit heroes and fight PvE encounters.

Deliverables: hero roster/attributes/skills/equipment, real-time combat (cooldowns, buffs/debuffs,
threat), enemy AI, first dungeons.

Acceptance: combat is deterministic and balanced to the model; PvE progression is playable; AI
behaves per design.

## M5 — World, Exploration & Events

**Objective:** a living world to explore.

Deliverables: continuous map, regions/biomes, weather, day/night, fog-of-war, dynamic events.

Acceptance: exploration and discovery persist; events spawn/resolve dynamically; world feels alive.

## M6 — Economy, Crafting & Market

**Objective:** a healthy player-driven economy.

Deliverables: professions, crafting, refined materials, player market and direct trade, sinks/faucets
tuning.

Acceptance: crafting and market function end-to-end; economy metrics within target ranges in
simulation.

## M7 — Guilds, PvP & World Bosses

**Objective:** large-scale social play.

Deliverables: guilds and roles, cooperative content, structured PvP, world bosses with mechanics.

Acceptance: guilds and PvP are fair and functional; world bosses support many players with
contribution-based rewards.

## M8 — LiveOps, Progression & Polish

**Objective:** long-term operation readiness.

Deliverables: research trees, achievements, leaderboards, seasonal events, telemetry-driven
balancing, performance and UX polish.

Acceptance: LiveOps content is data-authored via tooling; telemetry informs balance; performance
targets met under load.
