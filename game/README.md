# @aol/game

The rules of Age of Legends: domain components, systems and content definitions built on the ECS
runtime in [`@aol/engine`](../engine). Deterministic and free of I/O — it never imports the client
or server.

## Contents (initial)

- **components** — `Position`, `Velocity` (movement foundation).
- **systems** — `MovementSystem` (deterministic velocity integration).

Combat, resources, buildings, AI and other systems are added in their respective milestones (see
[../docs/roadmap/Milestones.md](../docs/roadmap/Milestones.md)).

## Design Source of Truth

Gameplay behavior implements the design in [../docs/gdd/](../docs/gdd/). When code and design
diverge, reconcile deliberately and update the design document.
