# ADR-0002: Technology stack for 2026

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction
- **Related:** [../architecture/Overview.md](../architecture/Overview.md)

## Context

Age of Legends targets web and mobile browsers with an authoritative, scalable backend and a shared
gameplay simulation. The stack must maximize code sharing between client and server, offer strong
type safety, perform well in the browser and on Node.js, and be maintainable for years.

## Decision

Adopt a TypeScript-first stack:

- **Language:** TypeScript in strict mode across all packages.
- **Runtime:** Node.js 22 LTS on the server.
- **Server:** Fastify for HTTP; the `ws` library for the authoritative WebSocket channel.
- **Client:** React 19 + Vite for UI; PixiJS 8 for world rendering.
- **Data:** PostgreSQL for durable state; Redis for ephemeral state and pub/sub.
- **Validation:** Zod at the protocol boundary.
- **Testing:** Vitest; **Lint/format:** ESLint (flat config) + Prettier.
- **Infra:** Docker / Docker Compose.

## Options Considered

1. **TypeScript everywhere (chosen)** — one language, shared domain/protocol code, strong types.
2. **Separate server language (e.g. Go/Rust) + TS client** — potential performance ceiling, but
   loses code sharing and doubles the domain implementation.
3. **A full game framework on the client (e.g. an all-in-one engine)** — faster to start, but
   fights a custom deterministic simulation core and constrains architecture.

## Consequences

- **Positive:** maximal code sharing (simulation, protocol, types); a single toolchain; a large
  talent pool; strong compile-time safety.
- **Trade-offs:** Node.js has a lower raw compute ceiling than native languages — mitigated by
  sharding, interest management and careful hot-path design; if a component ever needs native
  performance, it can be isolated behind a service boundary.
- **Follow-ups:** rendering (ADR-0006), networking (ADR-0004), data (ADR-0007) and the monorepo
  (ADR-0003) are recorded separately.
