# ADR-0007: PostgreSQL and Redis for persistence

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction, Backend Engineering
- **Related:** [../architecture/Persistence.md](../architecture/Persistence.md), [../architecture/Database.md](../architecture/Database.md)

## Context

The game needs durable, transactional storage for value-bearing state (accounts, kingdoms, heroes,
inventories, economy) and fast, ephemeral storage for sessions, presence, matchmaking and
cross-shard messaging.

## Decision

Use **PostgreSQL** as the durable system of record and **Redis** for ephemeral state and pub/sub.
The world runs in memory with a **write-behind** flush to PostgreSQL; value-bearing actions
(purchases, trades, guild changes) are written synchronously and transactionally. Redis holds
sessions, presence, rate-limit counters and cross-shard channels.

## Options Considered

1. **PostgreSQL + Redis (chosen)** — mature, transactional relational store plus a fast in-memory
   layer; a well-understood, scalable combination.
2. **A single NoSQL store** — flexible schema, but weaker transactional guarantees for economy and
   trades.
3. **In-memory only with periodic dumps** — fastest, but unacceptable durability for a persistent,
   value-bearing world.

## Consequences

- **Positive:** strong durability and transactions where value is at stake; fast hot-path reads and
  cross-shard coordination via Redis; a scalable, conventional operational model.
- **Trade-offs:** two data systems to operate; the write-behind window bounds potential loss for
  non-critical state — mitigated by synchronous writes for value-bearing actions.
- **Follow-ups:** schema lives in `database/schema` with ordered migrations; the save model is
  detailed in the persistence document.
