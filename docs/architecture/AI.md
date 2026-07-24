# AI Architecture

NPC and enemy intelligence is layered so simple actors stay cheap while important actors behave
convincingly. All AI runs inside the deterministic simulation (see [ECS.md](ECS.md)).

## Layers

1. **Behavior Trees** — reactive decision-making for common NPCs (patrol, guard, flee, assist).
   Cheap, readable and data-authorable.
2. **Utility AI** — scoring-based selection for tactical decisions (which skill to use, which
   target to focus) based on weighted considerations (threat, health, range, cooldowns).
3. **Goal-Oriented Action Planning (GOAP)** — for advanced agents that pursue goals by planning a
   sequence of actions from available world state (e.g. traders, quest-giving NPCs, elite tactics).

Most entities use layer 1; combat elites and bosses combine layers 2–3; ambient NPCs may use
simple state machines.

## Combat AI

- **Target selection** by threat and role (see [../gdd/Combat.md](../gdd/Combat.md)).
- **Ability usage** by utility scoring against the current battlefield state.
- **Coordination** for groups and bosses via shared blackboards and scripted phase logic (see
  [../gdd/Bosses.md](../gdd/Bosses.md)).

## World & NPC AI

- **Patrol and routine** behaviors tied to day/night and events.
- **Trade** behaviors for merchant NPCs feeding the economy.
- **Quest** behaviors for dynamic quest generation from world state (see
  [../gdd/Quests.md](../gdd/Quests.md)).

## Determinism & Performance

- AI decisions use only simulation state and the seeded RNG — no wall-clock or unscoped randomness.
- Decision frequency is throttled (not every actor thinks every tick) via staggered scheduling.
- Distant/inactive actors run reduced or suspended AI (level-of-detail), bounded by interest
  management (see [Networking.md](Networking.md), [Scalability.md](Scalability.md)).

## Data-Driven Behavior

Behaviors, utility weights and boss scripts are authored as data to support tooling, tuning and new
content without code changes.

## Future: Agent Training

The single deterministic simulation core is suitable for offline, headless runs, enabling future
training and evaluation of AI agents against reproducible scenarios.
