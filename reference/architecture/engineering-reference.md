# Engineering Reference — Patterns Studied

This note captures the **engineering patterns** the team examined for building a persistent,
multiplayer, browser-based game, and how each was adapted for Age of Legends. Only structure and
principles are referenced; no source content is reproduced.

## Patterns Examined

| Pattern                          | What it solves                                     | Age of Legends adaptation |
| -------------------------------- | -------------------------------------------------- | ------------------------- |
| Client/server separation         | Clear trust boundary, testable server              | `server` vs `client`, shared `game`/`engine`/`shared` |
| Authoritative server             | Cheat resistance, single source of truth           | Intent → validate → simulate → snapshot (see [../../docs/architecture/Networking.md](../../docs/architecture/Networking.md)) |
| Single simulation core           | One implementation of rules for server/client/tests| Deterministic ECS in `engine` + `game` (see [../../docs/architecture/ECS.md](../../docs/architecture/ECS.md)) |
| Entity management                | Flexible, performant world state                   | Component storage keyed by type; stable entity ids |
| Snapshot synchronization         | Consistent shared state at scale                   | Interest-managed snapshots/deltas, binary encoding |
| Modular system organization      | Maintainability and low coupling                   | Package boundaries with enforced dependency direction |
| Offline/headless capability      | Testing and future automation                      | Headless simulation for tests and future agent training |
| Automated testing discipline     | Confidence and regression safety                   | Golden-master determinism + unit/integration suites |

## Key Takeaways

1. **Determinism is the enabler.** A deterministic core is what makes prediction, reproducible tests
   and future automation all possible from one implementation.
2. **Authority must be absolute.** The client presents and predicts; it never decides. This is a
   security requirement, not a preference.
3. **Boundaries are worth enforcing.** A clear dependency direction between packages keeps a growing
   codebase maintainable.
4. **Headless-first pays off.** Designing the simulation to run without a renderer or network makes
   it testable and future-proof.

## How This Shapes Our Architecture

These takeaways are realized in the architecture documents and ADRs:
[../../docs/architecture/Overview.md](../../docs/architecture/Overview.md),
[ADR-0004](../../docs/adr/0004-authoritative-networking.md),
[ADR-0005](../../docs/adr/0005-deterministic-ecs.md). See also
[architecture-notes.md](architecture-notes.md).
