# Live Services

The server-owned platform that makes Age of Legends operable and monetizable as a long-lived
live-service game: telemetry, in-app purchases, remote configuration and incremental content
delivery. See [ADR-0009](../adr/0009-live-service-platform.md).

## 1. Telemetry

- A **structured, versioned event stream** covering sessions, progression, economy flows, combat
  outcomes, funnels and monetization.
- Event shapes are defined as a **typed schema in `shared`** so client and server agree, and are
  ingested and stored server-side.
- Telemetry feeds LiveOps decisions and balancing ([../gdd/LiveOps.md](../gdd/LiveOps.md),
  [../gdd/Economy.md](../gdd/Economy.md), [../gdd/Combat.md](../gdd/Combat.md)).
- Privacy-conscious: minimal personal data, clear retention, honoring platform consent and ad-id
  policies.

## 2. In-App Purchases (ethical)

- Store billing via the Capacitor bridge (Google Play / App Store).
- **Cosmetics, convenience and season passes only** — never power. This is a hard constraint
  ([../gdd/Monetization.md](../gdd/Monetization.md)).
- **Server-side validation and entitlement**: purchases are verified with the store and entitlements
  granted authoritatively; the client never grants entitlements or power.
- Purchases interact with the economy without creating inflation or devaluing player effort
  ([../gdd/Economy.md](../gdd/Economy.md)).

## 3. Remote Configuration & Feature Flags

- Server-controlled tuning of event parameters, drop tables, pacing and prices, and staged feature
  rollout — **without a client release**.
- Config is versioned and auditable; changes are reviewed like code.
- Enables A/B-style evaluation for tuning where appropriate.

## 4. Incremental Content Delivery

- New content and balance ship as **versioned, integrity-checked (checksum) packages** between store
  releases.
- The client validates package integrity and the **protocol version is negotiated on handshake**
  ([Networking.md](Networking.md)); incompatible clients are prompted to update.
- This keeps the live game fresh without waiting on store review cycles.

## Security & Trust

All four pillars are server-authoritative and validated at the boundary. Billing is verified with
the store; telemetry and config are access-controlled; content packages are checksum-verified. See
[Security.md](Security.md).

## Relationship to the Core

Live services wrap — but never bypass — the authoritative simulation. Gameplay remains deterministic
and server-authoritative ([ECS.md](ECS.md), [Server.md](Server.md)); live services govern
operation, measurement, monetization and delivery around it.
