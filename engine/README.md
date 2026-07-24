# @aol/engine

The reusable runtime for Age of Legends: a deterministic Entity Component System and the fixed-step
loop. Contains no game rules — those live in [`@aol/game`](../game). Depends only on
[`@aol/shared`](../shared).

## Contents

- **ecs** — `World`, `defineComponent`, `System`, queries and stepping.
- **loop** — `FixedStepLoop`, the fixed-timestep accumulator for deterministic simulation.

## Determinism

The `World` assigns entity ids in a stable order, iterates queries in creation order, and exposes a
single seeded `rng`. Systems must not use wall-clock time or `Math.random()`. See
[../docs/architecture/ECS.md](../docs/architecture/ECS.md).

## Example

```ts
import { World, defineComponent } from '@aol/engine';

const Health = defineComponent<{ value: number }>('Health');
const world = new World('seed');
const e = world.createEntity();
world.addComponent(e, Health, { value: 100 });
world.step(50);
```
