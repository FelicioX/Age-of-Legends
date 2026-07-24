# ADR-0004: Server-authoritative networking model

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction, Network Engineering
- **Related:** [../architecture/Networking.md](../architecture/Networking.md)

## Context

As a persistent, competitive MMORPG, Age of Legends must resist cheating, keep a single source of
truth for shared state, and remain responsive despite network latency.

## Decision

The server is authoritative. Clients send **intents**; the server validates them against
authoritative state, simulates the outcome, and broadcasts **snapshots/deltas** to interested
clients. Clients run **prediction and reconciliation** for the local player and **interpolation**
for remote entities. The transport is binary WebSocket; every inbound message is schema-validated.

## Options Considered

1. **Server-authoritative with client prediction (chosen)** — secure and responsive; more complex
   netcode.
2. **Client-authoritative / peer-to-peer** — simplest and most responsive, but trivially cheatable
   and unsuitable for a persistent economy and PvP.
3. **Lockstep determinism** — bandwidth-efficient for some genres, but ill-suited to a large,
   open, streaming MMORPG world.

## Consequences

- **Positive:** cheat resistance, a single source of truth, and a responsive local feel via
  prediction.
- **Trade-offs:** prediction/reconciliation and interest management add complexity — justified by
  the security and scale requirements and enabled by the deterministic core (ADR-0005).
- **Follow-ups:** protocol versioning, interest management and serialization are implemented in
  `shared`/`engine`.
