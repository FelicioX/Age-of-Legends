# Scalability

## Goals

Support a large, growing concurrent population with predictable latency and cost, and scale
horizontally as demand rises.

## Sharding

- The world is partitioned into **shards**, each owning a bounded region and player budget
  (`MAX_PLAYERS_PER_SHARD`).
- A shard runs its own authoritative simulation loop over the entities it owns.
- Players are routed to the shard owning their current region; handoffs occur at region boundaries.

## Stateless Front-Ends

- **Gateway** and **API** nodes are stateless and scale horizontally behind a load balancer.
- Session/presence state lives in Redis, so any front-end node can serve any request.

## Cross-Shard Coordination

- Redis pub/sub carries cross-shard events: chat, guild activity, market updates and global world
  events (see [Persistence.md](Persistence.md)).
- Global systems (market, guilds, leaderboards) are served by dedicated services that any shard can
  query.

## Interest Management

- Per-client updates are bounded to an area of interest, so bandwidth and CPU scale with what a
  player can perceive, not with world size (see [Networking.md](Networking.md)).

## Performance Practices

- Fixed-step simulation with staggered, level-of-detail AI (see [AI.md](AI.md)).
- Cache-friendly ECS storage and stable iteration.
- Compact binary snapshots with delta encoding.
- Hot reads served from Redis; durable writes batched via write-behind.

## Observability

- Metrics for tick duration, snapshot size, player counts, queue depths and DB/Redis latency.
- Structured logs and tracing to locate bottlenecks.
- Load and stress test suites (`tests/load`, `tests/stress`) validate capacity before release.

## Capacity Planning

- Each shard has a measured player and entity budget; scaling adds shards and front-ends rather
  than growing a single process.
- Autoscaling policies are defined in infrastructure (see `infrastructure/`).

## Risks & Mitigations

| Risk                         | Mitigation                                               |
| ---------------------------- | -------------------------------------------------------- |
| Hot regions overload a shard | Region sizing, dynamic re-sharding, soft population caps |
| Cross-shard chatter          | Batching, targeted pub/sub channels                      |
| DB write pressure            | Write-behind batching, aggregate boundaries              |
| Snapshot bandwidth           | Interest management, delta encoding, rate tuning         |
