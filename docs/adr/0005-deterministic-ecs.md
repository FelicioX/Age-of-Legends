# ADR-0005: Deterministic ECS simulation core

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction, Gameplay Engineering
- **Related:** [../architecture/ECS.md](../architecture/ECS.md), [ADR-0004](0004-authoritative-networking.md)

## Context

The game needs gameplay logic that can run authoritatively on the server, predictively on the
client, and headlessly in tests — without duplicating rules or diverging between environments.

## Decision

Implement the simulation as a **deterministic Entity Component System** with a **fixed timestep**
and a **seeded RNG**. Data lives in components; behavior lives in systems; the world runs systems in
a defined order each tick. The ECS runtime lives in `engine`; the rules live in `game`. The same
core runs on server and client. Determinism is verified by golden-master tests.

## Options Considered

1. **Deterministic ECS (chosen)** — composition-based, cache-friendly, testable, shareable across
   client/server.
2. **Object-oriented entity hierarchy** — familiar, but rigid, prone to deep inheritance and harder
   to keep deterministic and cache-friendly.
3. **Non-deterministic simulation** — simpler locally, but breaks server/client prediction and
   reproducible testing.

## Consequences

- **Positive:** one shared, testable core; reproducible simulation enabling prediction, replay and
  future agent training; flexible, data-driven content.
- **Trade-offs:** determinism imposes discipline (no wall-clock, scoped RNG, stable iteration,
  careful floating-point) — encoded in the coding standards and enforced by tests.
- **Follow-ups:** golden-master determinism tests are a milestone-1 acceptance criterion.
