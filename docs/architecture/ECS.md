# ECS — Entity Component System

## Why ECS

Age of Legends favors composition over inheritance. An Entity Component System keeps data
(components) separate from behavior (systems), enabling:

- flexible entity definitions by composition;
- cache-friendly iteration over homogeneous component data;
- deterministic, testable simulation independent of rendering and networking;
- data-driven content (heroes, buildings, items assembled from components).

## Core Concepts

- **Entity** — a stable identifier (`EntityId`) with no data or behavior of its own.
- **Component** — a plain data record attached to an entity (e.g. `Position`, `Health`,
  `Velocity`). Components hold no logic.
- **System** — a function that reads/writes components for entities matching a query and advances
  the simulation by one step.
- **World** — the container of all entities and component storage; exposes creation, destruction,
  queries and the system schedule.

## World & Storage

The world stores components in typed arrays/maps keyed by component type, enabling fast queries by
component signature (archetype). Entity creation returns an `EntityId`; destruction reclaims ids
safely. Storage layout is an implementation detail behind a stable API so it can be optimized
without changing systems.

## Scheduling & the Fixed-Step Loop

Systems run in a defined order each simulation tick. The loop uses a **fixed timestep** so
simulation is deterministic and frame-rate independent:

```
accumulator += frameDelta
while (accumulator >= STEP) {
  world.step(STEP)   // run all systems once
  accumulator -= STEP
}
render(interpolate(previous, current, accumulator / STEP))  // client only
```

The default step is derived from `SIM_TICK_RATE` (20 Hz). Rendering interpolates between the last
two simulation states for smoothness (client only; the server does not render).

## Determinism

- No wall-clock time or unfscoped randomness inside systems.
- All randomness comes from a seeded RNG owned by the world (see `shared/src/math`).
- Iteration order over entities is stable.
- Floating-point usage follows agreed conventions to keep server and client prediction consistent.

Determinism is validated by golden-master tests: a seed plus a scripted intent stream must always
produce the same end state.

## Shared Core

The ECS runtime lives in `engine`; the game rules (components and systems) live in `game`. The same
core runs on the server (authoritative) and on the client (prediction), preventing logic
duplication. See [Engine.md](Engine.md) and [Networking.md](Networking.md).

## Testing

Because systems are pure functions over component data, they are unit-tested directly by
constructing a world, adding entities/components, stepping and asserting resulting state — with no
renderer or network involved. See [../standards/Testing.md](../standards/Testing.md).
