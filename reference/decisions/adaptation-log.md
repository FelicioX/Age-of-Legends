# Adaptation Log

This log links each studied pattern to the **original Age of Legends design** it informed. It is the
audit trail proving that references informed *structure and principle* only, and that every concrete
system is the project's own.

| # | Pattern studied (source type)      | Age of Legends design (original)                         | Where implemented / specified |
| - | ---------------------------------- | -------------------------------------------------------- | ----------------------------- |
| 1 | Authoritative server (engineering) | Intent → validate → simulate → snapshot model            | [../../docs/architecture/Networking.md](../../docs/architecture/Networking.md), [ADR-0004](../../docs/adr/0004-authoritative-networking.md) |
| 2 | Single simulation core (engineering)| Deterministic ECS shared by server/client/tests          | [../../docs/architecture/ECS.md](../../docs/architecture/ECS.md), [ADR-0005](../../docs/adr/0005-deterministic-ecs.md) |
| 3 | Modular organization (engineering) | Layered typed packages with enforced boundaries          | [../../ARCHITECTURE.md](../../ARCHITECTURE.md), [ADR-0003](../../docs/adr/0003-monorepo-pnpm-turborepo.md) |
| 4 | Core progression loop (gameplay)   | Explore→gather→build→recruit→fight→unlock                | [../../docs/gdd/GameLoop.md](../../docs/gdd/GameLoop.md) |
| 5 | Base evolution (gameplay)          | Town-hall-gated kingdom of upgradable buildings          | [../../docs/gdd/Buildings.md](../../docs/gdd/Buildings.md) |
| 6 | Resource management (gameplay)     | Five resources with deliberate sinks/faucets             | [../../docs/gdd/Resources.md](../../docs/gdd/Resources.md), [../../docs/gdd/Economy.md](../../docs/gdd/Economy.md) |
| 7 | Team composition (gameplay)        | Archetypes + faction synergies, no dominant line-up      | [../../docs/gdd/Heroes.md](../../docs/gdd/Heroes.md), [../../docs/gdd/Combat.md](../../docs/gdd/Combat.md) |
| 8 | Map discovery (gameplay)           | Continuous map with persistent fog-of-war                | [../../docs/gdd/World.md](../../docs/gdd/World.md) |
| 9 | Living-world events (gameplay)     | Dynamic + seasonal event system                          | [../../docs/gdd/Events.md](../../docs/gdd/Events.md) |
|10 | Social interdependence (gameplay)  | Guilds, trade, contribution-based world bosses           | [../../docs/gdd/Guilds.md](../../docs/gdd/Guilds.md), [../../docs/gdd/Bosses.md](../../docs/gdd/Bosses.md) |
|11 | Long-term retention (gameplay)     | Ethical LiveOps: goals, seasons, no pay-to-win           | [../../docs/gdd/LiveOps.md](../../docs/gdd/LiveOps.md), [../../docs/gdd/Monetization.md](../../docs/gdd/Monetization.md) |

## Compliance Statement

No characters, art, UI, text, names, story, audio, assets or visual identity from any reference are
reproduced. All concrete content in Age of Legends — its universe, systems, numbers and art — is
original to the project.
