# Security Model

## Principles

- **Server authority** — the client cannot mutate game state; it can only request actions.
- **Validate at the boundary** — every inbound message is schema-validated before processing.
- **Least privilege** — services and tokens hold only the permissions they need.
- **Defense in depth** — multiple layers (transport, protocol, application, data).

## Authentication & Sessions

- Credential-based authentication issues short-lived **access tokens** and longer-lived
  **refresh tokens** (JWT), with secrets provided via environment variables.
- Sessions are tracked in Redis with TTLs and can be revoked.
- Token lifetimes are configurable (`JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`).

## Authorization

- Every action checks ownership and permissions against authoritative state (e.g. a player can only
  command their own kingdom/heroes; guild actions check role permissions).

## Input Validation

- The network protocol is validated with Zod schemas at the gateway before any handler runs.
- Intents are additionally validated against game rules (range, cooldown, cost, cooldowns,
  eligibility) before being applied by the simulation.

## Anti-Cheat

- Authoritative simulation makes client-side tampering ineffective for state.
- Rate limiting and anomaly detection guard against spam and automation abuse.
- PvP and economy systems include collusion/manipulation detection (see
  [../gdd/PvP.md](../gdd/PvP.md), [../gdd/Economy.md](../gdd/Economy.md)).

## Transport & Infrastructure

- TLS terminates at the edge; internal traffic is isolated.
- Secrets are never committed; `.env` is git-ignored and `.env.example` documents required keys.
- Dependencies are scanned for known vulnerabilities in CI (see the security workflow).

## Data Protection

- Sensitive data is minimized and protected at rest and in transit.
- Auditing tables record value-bearing actions (resource flows, trades) for investigation.

## Reporting

Security issues follow [SECURITY.md](../../SECURITY.md) and are never filed as public issues.
