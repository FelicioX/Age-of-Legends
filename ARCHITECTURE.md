# Architecture

This document is the top-level map of the Age of Legends codebase. It describes the module
boundaries and how data flows between them. Deep dives live under
[docs/architecture/](docs/architecture/).

## Guiding Principles

1. **One simulation core.** Game rules are deterministic and live in `game/`, executed on top of
   the ECS runtime in `engine/`. The same core runs on the authoritative server and, in a
   read-only predictive form, on the client. This mirrors the single-core philosophy proven by
   the engineering reference and avoids logic duplication between client and server.
2. **Authoritative server.** The server owns all game state. Clients send _intents_; the server
   validates, simulates and broadcasts _snapshots_. Clients never mutate authoritative state.
3. **Clean layering.** Dependencies point inward: `client`/`server` depend on `game`, which
   depends on `engine` and `shared`. `shared` depends on nothing internal.
4. **High cohesion, low coupling.** Each package and system owns one concern and communicates
   through well-defined interfaces and events.
5. **Everything is testable.** Deterministic simulation makes gameplay unit-testable without a
   renderer or a network.

## Package Dependency Graph

```
        ┌────────────┐        ┌────────────┐
        │   client   │        │   server   │
        └─────┬──────┘        └─────┬──────┘
              │                     │
              └──────────┬──────────┘
                         ▼
                   ┌────────────┐
                   │    game    │   domain systems + content
                   └─────┬──────┘
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌────────────┐        ┌────────────┐
       │   engine   │───────▶│   shared   │
       └────────────┘        └────────────┘
```

A package may only import from packages below it in this graph. This rule is enforced by
TypeScript project references and lint boundaries.

## Package Responsibilities

### `shared`

Pure, dependency-free foundations used everywhere:

- **types** — branded identifiers, primitive game types
- **math** — fixed-step friendly vector/scalar math, RNG, hashing
- **constants** — tunable global constants and enums
- **protocol** — the client/server message contract (versioned)
- **events** — shared event names and payload shapes
- **validation** — Zod schemas guarding the protocol boundary
- **utilities** — small, side-effect-free helpers

### `engine`

The reusable runtime with no game-specific rules:

- **ecs** — entities, components, systems, the world container and the scheduler
- **renderer** — a rendering abstraction (implemented by the client with PixiJS)
- **networking** — transport-agnostic client netcode: snapshot interpolation, reconciliation
- **pathfinding / navigation** — grid and navmesh traversal
- **serialization** — compact snapshot and delta encoding
- **resources** — asset and content handle management

### `game`

The rules of Age of Legends, expressed as ECS systems and content definitions:

- world, heroes, combat, buildings, resources, technologies, crafting, professions, inventory,
  equipment, loot, economy, quests, guilds, events and progression

`game` is deterministic and free of I/O. It never imports `client` or `server`.

### `server`

The authoritative backend. Composes the simulation core with I/O:

- **gateway** — WebSocket connection handling, session lifecycle, rate limiting
- **api** — Fastify HTTP services (auth, account, meta)
- **world** — the tick loop driving the simulation and producing snapshots
- **persistence** — PostgreSQL repositories and the write-behind save system
- **cache** — Redis for presence, sessions and pub/sub across shards
- **analytics / monitoring** — metrics and structured logging

### `client`

The player-facing application:

- **React** for HUD, menus and flows
- **PixiJS** for world rendering
- The engine's predictive simulation and netcode for a responsive feel

## Runtime Data Flow

```
Player input ─▶ client intent ─▶ (WebSocket) ─▶ server gateway
                                                     │
                                                     ▼
                                            validate + enqueue intent
                                                     │
                          fixed-step tick loop ◀─────┘
                                     │
                          game systems mutate world
                                     │
                          snapshot / delta encode
                                     │
              (WebSocket) ◀──────────┘  broadcast to interested clients
                     │
                     ▼
          client reconciliation + interpolation ─▶ renderer
```

## Networking Model (summary)

- **Transport:** WebSocket, binary frames.
- **Authority:** server-authoritative; clients send intents only.
- **Tick:** fixed simulation step (default 20 Hz); snapshots at a configurable rate (default 10 Hz).
- **Interest management:** clients receive only entities within their area of interest.
- **Client-side prediction & reconciliation** for the local player to hide latency.

Details: [docs/architecture/Networking.md](docs/architecture/Networking.md).

## Persistence Model (summary)

- PostgreSQL is the durable store for accounts, kingdoms, heroes, inventories and the world.
- Redis holds ephemeral state (sessions, presence, per-shard pub/sub, matchmaking).
- The world uses a write-behind strategy: simulation mutates in-memory state; a scheduler flushes
  dirty aggregates transactionally.

Details: [docs/architecture/Persistence.md](docs/architecture/Persistence.md) and
[docs/architecture/Database.md](docs/architecture/Database.md).

## Scalability (summary)

- The world is partitioned into **shards**; a shard owns a bounded region and player budget.
- Stateless gateway/API nodes scale horizontally behind a load balancer.
- Redis pub/sub carries cross-shard events (chat, guild, market, world bosses).

Details: [docs/architecture/Scalability.md](docs/architecture/Scalability.md).
