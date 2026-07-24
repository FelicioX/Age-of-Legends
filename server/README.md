# @aol/server

The authoritative backend for Age of Legends. Composes the deterministic simulation core with I/O:
the HTTP API (Fastify), the realtime gateway (WebSocket) and the world simulation runtime.

## Contents (initial)

- **config** — environment-resolved server configuration.
- **world/runtime** — the shard simulation runtime (ECS world + systems + tick loop).
- **index** — process entry: HTTP API, WebSocket gateway and lifecycle.

## Running

```bash
pnpm --filter @aol/server build
pnpm --filter @aol/server start
```

Requires PostgreSQL and Redis for persistence in later milestones (`pnpm run infra:up`). See
[../docs/architecture/Server.md](../docs/architecture/Server.md).
