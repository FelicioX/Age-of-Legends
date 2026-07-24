# ADR-0009: Live-service platform (telemetry, IAP, remote config, content delivery)

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Executive, Technical Direction, LiveOps, Economy
- **Related:** [ADR-0008](0008-mobile-packaging-capacitor.md), [../gdd/LiveOps.md](../gdd/LiveOps.md), [../gdd/Monetization.md](../gdd/Monetization.md), [../../reference/gameplay/technical-teardown.md](../../reference/gameplay/technical-teardown.md)

## Context

Age of Legends is a long-lived, monetized live-service game. Analysis of a shipping title in the
genre confirms that such games are **operations platforms**: their engineering weight lies in
telemetry, monetization, remote configuration, incremental content delivery and globalization —
not only gameplay. To be commercially competitive and sustainable, Age of Legends must build these
capabilities in from the start, on top of its authoritative server and deterministic core.

## Decision

Adopt a **live-service platform** with four server-owned pillars, all authoritative and privacy-
conscious:

1. **Telemetry pipeline** — a structured, versioned event stream (session, progression, economy,
   combat, funnel and monetization events) feeding LiveOps and balancing. Events are defined as a
   typed schema in `shared` and ingested server-side.
2. **In-app purchases (ethical)** — store billing (Google Play / App Store via the Capacitor
   bridge) for **cosmetics, convenience and season passes only**. Entitlements are granted and
   validated **server-side**; the client never grants power. Strictly non-pay-to-win per
   [../gdd/Monetization.md](../gdd/Monetization.md).
3. **Remote configuration & feature flags** — server-controlled tuning of events, drop tables,
   pacing and feature rollout without a client release, enabling data-driven LiveOps.
4. **Incremental content delivery** — versioned, integrity-checked (checksum) content packages so
   new content and balance ship between store releases; the protocol version is negotiated on
   handshake.

## Options Considered

1. **Build the platform in from the start (chosen)** — higher upfront cost, but avoids a painful
   retrofit and makes the game operable and monetizable from launch.
2. **Bolt on live-service later** — faster to a first playable, but telemetry, IAP validation and
   remote config are cross-cutting and expensive to retrofit safely — rejected.
3. **Third-party all-in-one LiveOps SDK** — quick, but couples core operations to an external
   vendor and its data model; may be adopted selectively for specific needs, not as the backbone.

## Consequences

- **Positive:** the game is measurable, tunable and monetizable from launch; balance and events are
  data-driven; content ships continuously; monetization stays ethical and server-verified.
- **Trade-offs:** more server surface and operational responsibility (privacy, data retention,
  billing validation); mitigated by clear schema versioning, server authority and the security
  model ([../architecture/Security.md](../architecture/Security.md)).
- **Follow-ups:** define the telemetry event schema in `shared`; implement server-side IAP
  entitlement validation; add remote config and content-package delivery; see
  [../architecture/LiveServices.md](../architecture/LiveServices.md).
