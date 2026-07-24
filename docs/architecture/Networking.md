# Networking

## Model: Server-Authoritative

The server owns all game state. Clients send **intents** (requests to act); the server validates,
simulates and returns **snapshots** (authoritative state). Clients never mutate authoritative
state. This prevents cheating and keeps a single source of truth. See
[ADR-0004](../adr/0004-authoritative-networking.md).

## Transport

- **WebSocket** with binary frames for low overhead.
- A separate HTTP (Fastify) surface handles auth, account and non-realtime meta operations.
- Ports and rates are configured via environment variables (`WS_PORT`, `SIM_TICK_RATE`,
  `NET_SNAPSHOT_RATE`).

## Message Categories

| Direction       | Type     | Purpose                                         |
| --------------- | -------- | ----------------------------------------------- |
| Client → Server | Intent   | Move, use skill, build, gather, trade, etc.     |
| Client → Server | Control  | Handshake, auth, ping, subscribe/unsubscribe    |
| Server → Client | Snapshot | Authoritative state for entities in view        |
| Server → Client | Delta    | Incremental changes since the last snapshot     |
| Server → Client | Event    | Discrete notifications (chat, rewards, results) |

The protocol is defined and versioned in `shared/src/protocol`, and every inbound message is
validated with Zod at the boundary before processing.

## Tick & Snapshot Rates

- **Simulation tick:** fixed step at `SIM_TICK_RATE` (default 20 Hz).
- **Snapshot broadcast:** `NET_SNAPSHOT_RATE` (default 10 Hz), decoupled from the tick to control
  bandwidth.

## Interest Management

Clients receive only entities within their **area of interest** (a region around their view/party).
This bounds per-client bandwidth and CPU regardless of world size and is essential to scalability
(see [Scalability.md](Scalability.md)).

## Client Prediction & Reconciliation

To hide latency for the local player:

1. The client predicts the local player's result of an intent immediately using the shared
   simulation core.
2. The server processes the intent authoritatively and returns state with an acknowledged input
   sequence number.
3. The client reconciles: it rewinds to the acknowledged state and replays unacknowledged inputs,
   correcting any divergence.

Remote entities are shown via **interpolation** between received snapshots for smooth motion.

## Serialization

Snapshots and deltas use a compact binary encoding (`engine/serialization`) to minimize bandwidth.
Delta encoding sends only changes since the client's last acknowledged snapshot.

## Reliability & Ordering

- Control and event messages are reliable and ordered.
- State updates are timestamped/sequenced; the newest authoritative state wins, and older
  in-flight updates are discarded.

## Security

- All inbound messages are validated and rate-limited.
- Intents are checked against authoritative state (range, cooldowns, ownership) before applying.
- See [Security.md](Security.md).
