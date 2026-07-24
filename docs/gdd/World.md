# World

## Setting

A continent long fractured by upheaval, now reopening to explorers, builders and warbands. Ancient
ruins hold power and danger; frontiers brim with resources; contested regions invite conflict. The
lore, geography, names and visual identity are original to Age of Legends.

## Structure

- **Continuous map** — a single, seamless top-down world rather than discrete levels.
- **Regions** — large areas with distinct themes, difficulty tiers and resource profiles.
- **Biomes** — forest, plains, mountains, wetlands, badlands and more, each affecting resources,
  movement and encounters.
- **Points of interest** — resource nodes, dungeons, ruins, camps, shrines and strategic control
  points.

## Environmental Systems

- **Weather** — regional weather states that affect visibility, movement and certain events.
- **Day/night cycle** — a global cycle influencing NPC behavior, spawns and event availability.
- **Fog of war** — the map is revealed through exploration; discoveries are persistent per player.

## Progression Geography

Difficulty and reward scale outward from the starting regions. Access to new regions is gated by
kingdom power, story progress and equipment, giving exploration a clear sense of advancement.

## Persistence & Sharing

The world is shared and authoritative. Resource nodes deplete and regenerate; events occur on
schedules and triggers; world bosses appear in designated regions. The world state persists
independently of any single player's presence.

## Sharding

The map is partitioned into shards for scalability, each owning a bounded region and player budget.
Cross-shard systems (chat, guild, market, world events) keep the world cohesive. See
[../architecture/Scalability.md](../architecture/Scalability.md).

## Related Systems

[Resources.md](Resources.md) · [Events.md](Events.md) · [Bosses.md](Bosses.md) ·
[Quests.md](Quests.md)
