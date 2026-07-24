# Engine

The `engine` package is the reusable runtime with no game-specific rules. It provides the ECS core,
rendering abstraction, netcode client and supporting subsystems consumed by `game`, `client` and
`server`.

## Modules

- **ecs** — world container, component storage, queries, system scheduler and the fixed-step loop
  (see [ECS.md](ECS.md)).
- **renderer** — a rendering abstraction (interface + scene graph concepts) implemented by the
  client using PixiJS; keeps game/engine free of a hard renderer dependency.
- **networking** — transport-agnostic client netcode: snapshot buffering, interpolation, prediction
  and reconciliation helpers (see [Networking.md](Networking.md)).
- **serialization** — compact binary snapshot/delta encoding shared by client and server.
- **pathfinding / navigation** — grid and navmesh traversal for movement and AI.
- **resources** — content/asset handle management and loading abstraction.

## Design Rules

- The engine depends only on `shared`. It never imports `game`, `client` or `server`.
- The engine contains no game rules — only mechanisms. Rules live in `game`.
- Public APIs are stable and documented so systems and content can rely on them.

## Determinism

The ECS core and simulation-facing utilities are deterministic (seeded RNG, stable iteration, fixed
step), enabling the same core to run authoritatively on the server and predictively on the client.

## Rendering Abstraction

`game` and simulation never call PixiJS directly. Instead they update components; the client's
renderer reads component state each frame and draws it. This preserves the ability to run the
simulation headless (server, tests, future agent training).

## Related

[ECS.md](ECS.md) · [Client.md](Client.md) · [Server.md](Server.md) · [Networking.md](Networking.md)
