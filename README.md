<div align="center">

# Age of Legends

**A next-generation MMORPG featuring persistent worlds, kingdom building, exploration, strategic combat, and large-scale multiplayer.**

[![CI](https://github.com/FelicioX/Age-of-Legends/actions/workflows/ci.yml/badge.svg)](https://github.com/FelicioX/Age-of-Legends/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](.nvmrc)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](tsconfig.base.json)

</div>

---

## Vision

Age of Legends is a modern MMORPG built around exploration, kingdom progression, persistent
online worlds, and large-scale cooperative and competitive gameplay. Players raise a kingdom,
recruit and develop a roster of heroes, harvest and refine resources, and push outward into a
living, shared world of dynamic events, world bosses, and rival guilds.

The project is engineered as a **platform**, not merely a game: a single deterministic
simulation core powers the authoritative server, the client-side prediction layer, automated
tests, and future content tooling.

## Project Goals

- Persistent online world with a continuous map, regions, biomes, weather and a day/night cycle
- Kingdom building: town hall, farms, mines, sawmills, barracks, laboratories and research
- Real-time exploration and fog-of-war discovery
- Strategic, real-time combat with skills, cooldowns, buffs, debuffs and threat
- Cooperative and competitive multiplayer — guilds, PvE, PvP and world bosses
- A living economy: gathering, crafting, professions, market and direct trade
- Dynamic world events and long-term LiveOps support
- A scalable, authoritative server architecture designed for large concurrent populations

## Project Status

✅ **Foundation complete** — 🚧 **Simulation Core (Milestone 1) next**

The engineering foundation is in place: the monorepo, the shared domain core, the documentation
set (Game Design Document, architecture, standards and decision records), the development tooling
and continuous integration. Gameplay systems are introduced incrementally in the milestones
defined in [ROADMAP.md](ROADMAP.md).

A separate **prototype track** under [`playable/`](playable/) validates game design ahead of the
typed packages — a complete client-side loop through phase 4, described below. It proves design,
not architecture; the milestones remain the delivery plan.

See [docs/roadmap/Milestones.md](docs/roadmap/Milestones.md) for the detailed plan and
[TASKS.md](TASKS.md) for current status.

## Play the Prototype (no install)

A self-contained, no-build playable slice lives in [`playable/`](playable/). For the quickest start,
double-click **`JOGAR - Age of Legends.html`** (or **`JOGAR - Age of Legends.bat`**) in the project
root — it opens the game in your default browser. You can also open
[`playable/index.html`](playable/index.html) directly. No Node.js, no server, no installation is
required.

The prototype is a complete client-side game loop. Beyond the kingdom and exploration core, it
covers a hero roster with factions and synergy, formation, a build queue, a campaign chapter with
idle rewards, a scripted onboarding, daily login and missions, summon with published odds and
pity, star ascension and equipment, multi-slot saves, asynchronous arena PvP, a guild with
research techs, achievements, a shop, a season pass and rotating events — rendered through a
drawn battle scene with synthesized audio and procedural portraits. Online play, monetization and
art are simulated locally: there is no backend and no imported asset. See
[playable/README.md](playable/README.md).

## Technology Stack

| Layer           | Technology                  | Rationale (summary)                                     |
| --------------- | --------------------------- | ------------------------------------------------------- |
| Language        | TypeScript (strict)         | One typed language across client, server and shared     |
| Runtime         | Node.js 22 LTS              | Modern, performant, long-term support                   |
| Monorepo        | pnpm workspaces + Turborepo | Fast, cache-aware builds across packages                |
| Server API      | Fastify                     | High-throughput, schema-first HTTP services             |
| Realtime        | WebSocket (`ws`)            | Low-overhead authoritative realtime channel             |
| Client shell    | React 19 + Vite             | Mature UI layer with fast tooling                       |
| Rendering       | PixiJS 8 (WebGL/WebGPU)     | High-performance 2D rendering with fine-grained control |
| Persistence     | PostgreSQL                  | Durable, relational, transactional world state          |
| Cache / Pub-Sub | Redis                       | Presence, sessions, matchmaking and fan-out             |
| Validation      | Zod                         | Runtime validation of the network protocol              |
| Tests           | Vitest                      | Fast unit/integration testing with coverage             |
| Containers      | Docker / Docker Compose     | Reproducible local and CI infrastructure                |

Full justification: [docs/architecture/Overview.md](docs/architecture/Overview.md) and
[docs/adr/0002-technology-stack.md](docs/adr/0002-technology-stack.md).

> **Version ceilings.** TypeScript is held at the 6.x line because `typescript-eslint` does not yet
> support TypeScript 7, and `@types/node` is held at 22.x to match the pinned Node runtime. Both are
> enforced by `ignore` rules in `.github/dependabot.yml` and explained, with the conditions for
> lifting them, in [ADR-0010](docs/adr/0010-typescript-version-ceiling.md).

## Repository Layout

```
Age-of-Legends/
├── shared/          # Cross-cutting types, math, constants, protocol, validation
├── engine/          # ECS runtime, rendering abstraction, netcode client
├── game/            # Domain systems and content definitions (rules of the world)
├── server/          # Authoritative server: gateway, API, world simulation, persistence
├── client/          # React + PixiJS player client
├── playable/        # No-build browser prototype used to validate game design
├── docs/            # Vision, GDD, architecture, roadmap, standards, ADRs
├── reference/       # Study notes on engineering and gameplay references
├── database/        # Schema, migrations and seeds
├── infrastructure/  # Docker, orchestration and observability
├── tools/           # Generators, validators and pipeline utilities
├── tests/           # Cross-package integration, load and e2e suites
└── scripts/         # Build, deploy and maintenance scripts
```

Detailed responsibilities: [ARCHITECTURE.md](ARCHITECTURE.md).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **>= 22**
- [pnpm](https://pnpm.io/) **>= 9** (`corepack enable` will provide it)
- [Docker](https://www.docker.com/) (for local PostgreSQL and Redis)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local environment file
cp .env.example .env

# 3. Start local infrastructure (PostgreSQL + Redis)
pnpm run infra:up

# 4. Build all packages
pnpm run build

# 5. Run the test suite
pnpm run test
```

### Common Tasks

| Command                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `pnpm run dev`            | Run all packages in watch mode                    |
| `pnpm run build`          | Build every workspace package                     |
| `pnpm run test`           | Run the full test suite                           |
| `pnpm run lint`           | Lint the codebase                                 |
| `pnpm run typecheck`      | Type-check every package                          |
| `pnpm run check`          | Format check + lint + typecheck + tests           |
| `pnpm run smoke:playable` | Headless smoke test for the `playable/` prototype |

A `Makefile` mirrors these commands for convenience (`make help`).

## Documentation

- [Game Design Document](docs/gdd/000_GDD.md) — the complete design of the game
- [Architecture Overview](docs/architecture/Overview.md) — how the system is built
- [Roadmap](docs/roadmap/ROADMAP.md) and [Milestones](docs/roadmap/Milestones.md)
- [Coding Standards](docs/standards/CodingStandards.md)
- [Decision Records](docs/adr/) — the log of architectural decisions

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Coding Standards](docs/standards/CodingStandards.md) before opening a pull request. All
contributions are expected to include tests and documentation.

## License

This project is proprietary. See [LICENSE](LICENSE) for details.
