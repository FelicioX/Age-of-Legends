# Backlog

The full inventory of known, not-yet-scheduled work. Near-term tasks are promoted from here into
[../../TASKS.md](../../TASKS.md); the delivery order lives in
[../../ROADMAP.md](../../ROADMAP.md) and [Milestones.md](Milestones.md).

An item belongs here when it is understood well enough to describe but is not committed to a
milestone. Items are grouped by theme, not by priority.

## Repository and process

- Configure branch protection on `main`: required status checks (CI, Security), no direct pushes,
  linear history.
- Decide the repository's visibility. It is currently public.
- Add a release workflow that tags `vX.Y.Z` and cuts notes from the `CHANGELOG.md`, per
  [Releases.md](Releases.md).
- Add test coverage reporting to CI and set a floor that cannot regress.

## Architecture

- **Close the prototype split.** The systems proven in `playable/` live in plain browser scripts,
  isolated from the typed packages. Fold the rules into `game/` and the loop into `engine/` so the
  typed layers own behavior and the prototype becomes a thin shell over them. This is the largest
  standing piece of technical debt.
- Define the content pipeline: where hero, building, enemy and event definitions live once they
  are shared between the prototype, the server and tooling.
- Establish the golden-master determinism harness before the ECS grows beyond a few systems.

## Toolchain

- Lift the TypeScript 6.x ceiling once `typescript-eslint` supports TypeScript 7, and supersede
  [ADR-0010](../adr/0010-typescript-version-ceiling.md).
- Upgrade the Node runtime past 22 as a deliberate change across `.nvmrc`, the CI workflow and the
  `engines` field, then lift the `@types/node` ceiling with it.

## Presentation

- Premium design system: type scale, color system, spacing, elevation and motion, applied across
  every screen.
- UI kit and icon set, replacing placeholder glyphs.
- Visual effects and game feel pass on the battle scene.
- Environment art direction for the island world.
- Audio direction beyond synthesis: a scored music loop and a coherent effect set.

> All art, audio, names and text must be original to Age of Legends. References inform technique
> only; no protected content is reused. See [../../PROJECT.md](../../PROJECT.md).

## Gameplay systems not yet built

Derived from the gap analysis in [../design-review/](../design-review/). These exist as design,
not as code, in either the prototype or the typed packages.

- Crafting and professions; the refining chain behind the five resources.
- The player market and direct trade, with sinks and faucets tuned together.
- World bosses and the cooperative encounter format.
- Quests beyond the campaign chapter: story, repeatable and guild lines.
- Research trees in the typed layers.
- Leaderboards beyond the arena ladder.
- Social layer: friends, mail, chat channels and guild-to-guild diplomacy.
- Dynamic world events on the shared map, as distinct from the prototype's rotating live events.

## Platform and live service

- Telemetry pipeline and the event taxonomy behind it
  ([ADR-0009](../adr/0009-live-service-platform.md)).
- Server-validated purchases and the receipt store.
- Remote configuration and feature flags.
- Incremental, integrity-checked content delivery.
- Capacitor packaging, store billing and push notifications
  ([ADR-0008](../adr/0008-mobile-packaging-capacitor.md)).
- Localization: externalize all player-facing strings before the catalog grows.

## Operations

- Observability: structured logging, metrics and tracing across the gateway and the simulation.
- Load and soak testing against the authoritative server.
- Backup, restore and migration runbooks for PostgreSQL.
- Incident response and on-call expectations, once there is a live service to respond to.
