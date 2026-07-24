# Architecture Overview

This document expands on the root [ARCHITECTURE.md](../../ARCHITECTURE.md) with the reasoning
behind the technology choices and the system-level design.

## Design Goals

- **Authoritative and secure** — the server owns all state; clients present and predict.
- **Deterministic** — gameplay simulation is reproducible for testing, replay and authority.
- **Scalable** — sharded world, stateless front-ends, horizontal scale.
- **Modular** — clean package boundaries, low coupling, high cohesion.
- **Cross-platform** — one codebase for web and mobile.

## Technology Stack and Rationale

### TypeScript (strict)

One strongly typed language spans client, server and shared code, eliminating a language boundary
and enabling shared domain logic and protocol types. Strict mode (with
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`) catches whole classes of bugs at
compile time.

### Node.js 22 LTS

Mature, high-performance JavaScript runtime with excellent WebSocket and async I/O support and
long-term support. Sharing a runtime with the browser-oriented toolchain simplifies the platform.

### pnpm workspaces + Turborepo

A monorepo keeps client, server and shared code in one place with atomic changes across the
protocol boundary. pnpm gives fast, disk-efficient installs; Turborepo provides cache-aware,
parallel task orchestration. See [ADR-0003](../adr/0003-monorepo-pnpm-turborepo.md).

### Fastify (HTTP) + `ws` (realtime)

Fastify is a fast, schema-first HTTP framework for auth, account and meta endpoints. The `ws`
library provides a minimal, high-performance WebSocket layer for the authoritative realtime
channel, where we control framing and interest management directly. See
[Networking.md](Networking.md).

### React 19 + Vite + PixiJS 8

React structures the HUD, menus and flows; Vite provides fast dev and optimized builds. PixiJS is a
high-performance 2D renderer (WebGL/WebGPU) that gives fine-grained control suited to a custom,
ECS-driven world — chosen over a full game framework to avoid fighting the simulation core. See
[ADR-0006](../adr/0006-rendering-pixijs.md).

### PostgreSQL + Redis

PostgreSQL provides durable, transactional, relational storage for accounts, kingdoms, heroes and
the world. Redis provides ephemeral state: sessions, presence, matchmaking and cross-shard pub/sub.
See [Persistence.md](Persistence.md), [Database.md](Database.md) and
[ADR-0007](../adr/0007-postgres-redis.md).

### Zod

Runtime validation of every inbound protocol message at the trust boundary, complementing static
types with runtime guarantees. See [Networking.md](Networking.md) and [Security.md](Security.md).

### Vitest, ESLint, Prettier, Docker

Vitest for fast unit/integration tests with coverage; ESLint (flat config) and Prettier for
consistency; Docker/Compose for reproducible infrastructure locally and in CI.

## System Map

```
┌──────────────────────── Client (browser / mobile) ────────────────────────┐
│  React HUD/UI  │  PixiJS renderer  │  engine: prediction + netcode client   │
└───────────────────────────────┬────────────────────────────────────────────┘
                                 │ WebSocket (binary intents/snapshots)
┌───────────────────────────────▼────────────────────────────────────────────┐
│  Gateway (ws)  │  API (Fastify)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  World simulation (fixed-step tick) ── game systems on engine ECS core       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Persistence (PostgreSQL)   │   Cache & Pub/Sub (Redis)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Cross-Cutting Concerns

- **Configuration** via environment variables (see `.env.example`).
- **Observability** — structured logs and metrics (see [Server.md](Server.md)).
- **Security** — validation, authority and rate limiting (see [Security.md](Security.md)).
- **Testing** — determinism enables unit-testing gameplay without I/O.

## Related Documents

[Engine.md](Engine.md) · [Client.md](Client.md) · [Server.md](Server.md) ·
[Networking.md](Networking.md) · [Persistence.md](Persistence.md) · [Database.md](Database.md) ·
[Security.md](Security.md) · [ECS.md](ECS.md) · [AI.md](AI.md) · [Scalability.md](Scalability.md)
