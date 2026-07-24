# Persistence

## Stores

- **PostgreSQL** — durable, transactional system of record: accounts, kingdoms, buildings, heroes,
  inventories, market, guilds and persistent world state.
- **Redis** — ephemeral, fast state: sessions, presence, matchmaking queues, rate-limit counters
  and cross-shard pub/sub.

See [Database.md](Database.md) for the relational model and [ADR-0007](../adr/0007-postgres-redis.md).

## Write-Behind World State

The world simulation runs in memory for performance. Persistence uses a **write-behind** strategy:

1. Systems mutate in-memory state each tick and mark aggregates dirty.
2. A scheduler periodically flushes dirty aggregates to PostgreSQL in transactions.
3. Critical, low-frequency actions (purchases, trades, guild changes) are written synchronously and
   transactionally.

This balances throughput (most state is hot in memory) with durability (bounded data loss window,
transactional integrity for value-bearing actions).

## Aggregates & Boundaries

State is organized into aggregates with clear consistency boundaries (e.g. a kingdom and its
buildings; a player and their inventory; a guild and its members). Cross-aggregate operations use
explicit transactions or well-defined eventual-consistency flows.

## Sessions & Presence

- Sessions and auth tokens are tracked in Redis with TTLs.
- Presence (who is online, where) is maintained in Redis for fast lookups and cross-shard routing.

## Save Model

- On login: the player's aggregates are loaded into the owning shard's memory.
- During play: write-behind flushing plus synchronous critical writes.
- On logout/idle: a final flush persists the latest state and releases memory.

## Backups & Migrations

- Schema is versioned via ordered migrations under `database/migrations`.
- Seeds under `database/seeds` provide baseline/content data for development.
- Backups are produced by scheduled jobs (see `scripts/maintenance`); restore procedures are
  documented alongside deployment.

## Failure Handling

- Transactions ensure value-bearing actions are atomic.
- The flush scheduler is idempotent and resumable.
- Redis is treated as a cache/coordination layer; loss of Redis degrades but does not corrupt the
  durable store.
