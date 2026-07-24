# @aol/shared

Cross-cutting foundations for Age of Legends. Pure, dependency-light building blocks imported by
every other package. This package sits at the bottom of the dependency graph and imports nothing
internal.

## Modules

| Module       | Contents                                                            |
| ------------ | ------------------------------------------------------------------- |
| `types`      | Branded identifier types (`EntityId`, `PlayerId`, …) and primitives |
| `math`       | Deterministic math: vectors, scalars, seeded RNG, hashing           |
| `constants`  | Global tunable constants (tick rate, party size, resources, …)      |
| `protocol`   | The versioned client/server message contract                        |
| `validation` | Zod schemas validating inbound messages at the trust boundary       |
| `events`     | Canonical shared event names                                        |
| `utilities`  | Small, side-effect-free helpers                                     |

## Determinism

The `math` module (especially `Rng`) is deterministic by design: the same seed and call sequence
always produce the same output across platforms. Gameplay code must use `Rng`, never
`Math.random()`. See [../docs/architecture/ECS.md](../docs/architecture/ECS.md).

## Usage

```ts
import { Rng, Vec2Math, parseClientMessage, SIM_STEP_MS } from '@aol/shared';

const rng = Rng.fromString('age-of-legends');
const position = Vec2Math.add(Vec2Math.vec2(0, 0), Vec2Math.vec2(1, 0));
```

## Scripts

- `pnpm --filter @aol/shared build` — compile to `dist`
- `pnpm --filter @aol/shared test` — run unit tests
- `pnpm --filter @aol/shared typecheck` — type-check without emit
