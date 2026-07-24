# Roadmap

High-level delivery plan for Age of Legends. Detailed, checklist-level planning lives in
[docs/roadmap/Milestones.md](docs/roadmap/Milestones.md) and the
[Backlog](docs/roadmap/Backlog.md).

The project is delivered in **milestones**. Each milestone is a vertical slice that is designed,
built, tested and documented before the next begins.

| Milestone | Theme                         | Status         |
| --------- | ----------------------------- | -------------- |
| M0        | Foundation & Documentation    | 🚧 In progress |
| M1        | Simulation Core (ECS)         | ⏳ Planned     |
| M2        | Authoritative Networking      | ⏳ Planned     |
| M3        | Kingdom Building & Resources  | ⏳ Planned     |
| M4        | Heroes, Combat & PvE          | ⏳ Planned     |
| M5        | World, Exploration & Events   | ⏳ Planned     |
| M6        | Economy, Crafting & Market    | ⏳ Planned     |
| M7        | Guilds, PvP & World Bosses    | ⏳ Planned     |
| M8        | LiveOps, Progression & Polish | ⏳ Planned     |

## M0 — Foundation & Documentation (current)

**Goal:** establish a professional engineering baseline before gameplay code.

- Monorepo, tooling, CI and containerized infrastructure
- Full documentation set: vision, GDD, architecture, standards, ADRs
- Shared domain core (types, math, protocol, validation) with tests
- Buildable package skeletons for engine, game, server and client

**Acceptance:** `pnpm run check` passes; documentation complete; foundation committed.

## M1 — Simulation Core

Deterministic ECS: world container, component storage, system scheduler, fixed-step loop and a
seeded RNG. Golden-master tests prove determinism.

## M2 — Authoritative Networking

WebSocket gateway, intent/snapshot protocol, interest management, client prediction and
reconciliation. A player can move in a shared world.

## M3 — Kingdom Building & Resources

Town hall, farms, mines, sawmills, barracks and laboratories; the five resources; build/upgrade
timers and production. Persistence of kingdom state.

## M4 — Heroes, Combat & PvE

Hero roster, attributes, equipment and skills; real-time combat with cooldowns, buffs/debuffs and
threat; enemy AI and the first PvE encounters.

## M5 — World, Exploration & Events

Continuous map, regions, biomes, weather, day/night cycle, fog-of-war discovery and the dynamic
event system.

## M6 — Economy, Crafting & Market

Professions, crafting, the player market and direct trade, with sinks and faucets tuned for a
healthy economy.

## M7 — Guilds, PvP & World Bosses

Guild creation and roles, cooperative content, structured PvP and large-scale world boss
encounters.

## M8 — LiveOps, Progression & Polish

Research trees, achievements, leaderboards, seasonal events, telemetry-driven balancing and
performance/UX polish.

> Milestones may be re-sequenced as design review dictates. Any change is recorded in
> [DECISIONS.md](DECISIONS.md).
