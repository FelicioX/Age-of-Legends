# ADR-0006: PixiJS as the rendering layer

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction, Client Engineering
- **Related:** [../architecture/Client.md](../architecture/Client.md), [ADR-0005](0005-deterministic-ecs.md)

## Context

The game is top-down 2D and must render a busy world performantly on web and mobile, driven by a
custom deterministic simulation. The renderer must integrate with an ECS core and a React UI shell
without dictating the game's architecture.

## Decision

Use **PixiJS 8** (WebGL/WebGPU) as the rendering layer behind the engine's rendering abstraction.
Game and simulation code never call PixiJS directly; the client's renderer reads component state
each frame and draws it. React handles HUD, menus and flows.

## Options Considered

1. **PixiJS (chosen)** — a high-performance 2D renderer, not a full framework; gives fine-grained
   control and composes cleanly with a custom ECS and React.
2. **A full 2D game framework** — faster to prototype, but its scene/update model would compete
   with the deterministic simulation core and constrain architecture.
3. **Raw canvas/WebGL** — maximal control, but reinvents batching, text and sprite management PixiJS
   already provides well.

## Consequences

- **Positive:** strong rendering performance; a clean split between simulation and presentation; the
  simulation stays headless-capable for server and tests.
- **Trade-offs:** we own more of the game-loop/scene wiring than a full framework would provide —
  acceptable given the control it yields.
- **Follow-ups:** the engine defines the rendering abstraction; the client implements it with PixiJS.
