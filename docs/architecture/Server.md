# Server

The `server` package is the authoritative backend. It composes the deterministic simulation core
with I/O: connection handling, HTTP APIs, the world tick loop, persistence and caching.

## Responsibilities

- Own all authoritative game state.
- Accept and validate client intents; reject invalid or unauthorized actions.
- Run the fixed-step world simulation and produce snapshots/deltas.
- Persist state (write-behind + synchronous critical writes).
- Coordinate cross-shard systems via Redis.

## Modules

- **gateway** — WebSocket connection lifecycle, handshake, auth, rate limiting, message routing.
- **api** — Fastify HTTP services: auth, account, meta and admin endpoints.
- **world** — the shard simulation: the tick loop, intent application, snapshot generation and
  interest management.
- **persistence** — PostgreSQL repositories and the write-behind flush scheduler.
- **cache** — Redis for sessions, presence, matchmaking and pub/sub.
- **analytics / monitoring** — metrics, structured logging and health checks.
- **scheduler** — timers for production, events, backups and maintenance.

## Tick Loop

Each shard advances its simulation at `SIM_TICK_RATE`:

```
loop every STEP:
  drain and validate queued intents
  world.step(STEP)        // run game systems
  if snapshot due: build and broadcast per-interest snapshots/deltas
  mark dirty aggregates for write-behind
```

## Authority & Validation

- Intents are validated against the protocol schema and then against game rules (ownership, range,
  cost, cooldowns) before being applied.
- The client's predicted result is never trusted; the server's result is authoritative.

## Scaling

- Stateless gateway/API nodes scale horizontally; world shards scale by partitioning the map.
- See [Scalability.md](Scalability.md) and [Persistence.md](Persistence.md).

## Observability

- Metrics: tick duration, intent queue depth, snapshot size, player counts, DB/Redis latency.
- Structured logs with correlation ids; health/readiness endpoints for orchestration.

## Related

[Networking.md](Networking.md) · [Persistence.md](Persistence.md) · [Security.md](Security.md) ·
[ECS.md](ECS.md)
