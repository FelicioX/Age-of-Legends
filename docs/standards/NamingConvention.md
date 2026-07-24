# Naming Conventions

Consistent names make the codebase navigable and self-documenting.

## Casing

| Element                       | Convention             | Example                     |
| ----------------------------- | ---------------------- | --------------------------- |
| Types, interfaces, enums      | `PascalCase`           | `HeroArchetype`, `EntityId` |
| Classes, React components     | `PascalCase`           | `WorldRenderer`, `HeroCard` |
| Variables, functions, methods | `camelCase`            | `spawnEntity`, `tickRate`   |
| Module-level constants        | `SCREAMING_SNAKE_CASE` | `MAX_PARTY_SIZE`            |
| Type parameters               | `PascalCase` (short)   | `T`, `TComponent`           |
| Files (TypeScript)            | `kebab-case.ts`        | `system-scheduler.ts`       |
| Files (React components)      | `PascalCase.tsx`       | `HeroCard.tsx`              |
| Directories                   | `kebab-case`           | `world-editor`              |
| Database tables/columns       | `snake_case`           | `guild_members`             |
| Environment variables         | `SCREAMING_SNAKE_CASE` | `SIM_TICK_RATE`             |

## Semantics

- Names describe intent, not implementation: `remainingCooldownMs`, not `x`.
- Booleans read as predicates: `isAlive`, `hasShield`, `canBuild`.
- Functions are verbs: `applyDamage`, `buildSnapshot`; queries are noun-phrases: `livingHeroes`.
- Units are explicit in names when ambiguous: `durationMs`, `distanceTiles`.

## Domain Vocabulary

Use the shared domain vocabulary consistently (kingdom, hero, party, shard, intent, snapshot,
tick, node). Avoid synonyms for the same concept.

## Components & Systems (ECS)

- Components are nouns describing data: `Position`, `Health`, `Velocity`.
- Systems are named for what they do, suffixed `System`: `MovementSystem`, `CombatSystem`.

## Events & Protocol

- Protocol message types are `PascalCase` discriminants (e.g. `MoveIntent`, `WorldSnapshot`).
- Event names are namespaced and stable; changing one is a protocol change (see
  [../architecture/Networking.md](../architecture/Networking.md)).

## Avoid

- Abbreviations that aren't domain-standard.
- Hungarian notation and type prefixes/suffixes (`IFoo`, `TBar`) except conventional type params.
- Reusing a name for two concepts.
