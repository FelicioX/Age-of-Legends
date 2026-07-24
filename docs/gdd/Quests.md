# Quests

## Concept

Quests guide players, teach systems and provide steady, directed progression. They range from a
guided onboarding chain to open-ended repeatable and dynamic quests.

## Quest Types

- **Main chain** — the guided narrative and onboarding path that introduces systems in order.
- **Side quests** — optional, region-flavored objectives with meaningful rewards.
- **Daily/weekly** — repeatable goals that structure regular play and reward returning.
- **Dynamic quests** — generated from world state (events, discoveries, boss spawns), keeping the
  world reactive (see [../architecture/AI.md](../architecture/AI.md)).
- **Guild quests** — collective objectives (see [Guilds.md](Guilds.md)).

## Structure

A quest defines objectives (kill, gather, build, explore, deliver, escort), prerequisites, rewards
and optional time limits. Quests are data-driven to support tooling and rapid authoring.

## Rewards

Resources, currency, equipment, hero and research materials, and progression unlocks. Reward tuning
respects the economy (see [Economy.md](Economy.md)).

## Tracking & UX

Clear objective tracking, waypoints and progress indicators keep goals legible. Onboarding quests
reveal one system at a time to avoid overwhelming new players.

## Related Systems

[World.md](World.md) · [PvE.md](PvE.md) · [Events.md](Events.md)
