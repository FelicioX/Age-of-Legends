# Database

The relational model in PostgreSQL. This is a design reference; the authoritative schema lives in
`database/schema` and evolves through ordered migrations in `database/migrations`.

## Conventions

- `snake_case` table and column names.
- Surrogate primary keys (`bigint` identity or UUID) plus natural unique constraints.
- `created_at` / `updated_at` timestamps on mutable tables.
- Foreign keys with explicit `on delete` behavior.
- Money/quantities as integers (smallest unit) to avoid floating-point error.

## Core Tables (initial model)

### Accounts & Auth

- `accounts` — identity, credentials reference, status, timestamps.
- `sessions` — issued refresh sessions (also mirrored in Redis for fast checks).

### Kingdom

- `kingdoms` — one per player: level, shard, coordinates, resource balances.
- `buildings` — building instances: type, tier, position, state, timers.
- `resource_ledger` — append-only record of significant resource flows (auditing/economy).

### Heroes & Items

- `heroes` — roster entries: archetype, level, star rank, attributes snapshot.
- `hero_skills` — per-hero skill levels.
- `inventory_items` — item instances: type, quality, affixes, owner, equipped slot.

### Progression

- `research` — per-kingdom technology levels and in-progress timers.
- `quests` — per-player quest progress and state.
- `achievements` — earned achievements.

### Social & Economy

- `guilds`, `guild_members` — guild data and membership/roles.
- `market_listings` — active market orders.
- `trades` — completed trades/auctions (auditing).

### World

- `world_nodes` — persistent resource nodes and points of interest state.
- `world_events` — active/historical event records.

## Indexing

- Foreign keys and frequent lookup columns (owner, shard, type, status) are indexed.
- Market and leaderboard queries get purpose-built composite indexes.
- Hot read paths are additionally served from Redis where appropriate.

## Migrations & Seeds

- Migrations are ordered, reversible where feasible, and reviewed like code.
- Seeds provide content/config for development and tests.
- See [Persistence.md](Persistence.md) for the runtime save strategy.
