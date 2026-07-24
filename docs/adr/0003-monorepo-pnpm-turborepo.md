# ADR-0003: Monorepo with pnpm workspaces and Turborepo

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction
- **Related:** [ADR-0002](0002-technology-stack.md)

## Context

Client, server and shared gameplay code must evolve together, especially across the network
protocol boundary. Splitting them into separate repositories would make atomic, cross-cutting
changes painful and error-prone.

## Decision

Use a single monorepo with **pnpm workspaces** for dependency management and **Turborepo** for
task orchestration. Packages: `shared`, `engine`, `game`, `server`, `client` (plus `tools/*`).
TypeScript project references enforce build order and boundaries.

## Options Considered

1. **Monorepo + pnpm + Turbo (chosen)** — atomic cross-package changes, shared tooling, cached
   builds.
2. **Multiple repositories** — strong isolation, but painful cross-cutting changes and version
   skew across the protocol.
3. **Monorepo with a heavier build system** — more power than needed at this stage; higher
   complexity.

## Consequences

- **Positive:** atomic changes across the protocol; one install and one toolchain; fast,
  cache-aware, parallel builds; enforced dependency direction.
- **Trade-offs:** a monorepo requires discipline around boundaries — enforced via project
  references and lint rules.
- **Follow-ups:** CI caches Turbo outputs; boundary rules are documented in the coding standards.
