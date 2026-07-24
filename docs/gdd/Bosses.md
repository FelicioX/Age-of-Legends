# Bosses

## Concept

Bosses are the peak of PvE spectacle and coordination — from party-scale dungeon bosses to
region-wide world bosses that call entire guilds to arms.

## Tiers

- **Dungeon bosses** — climactic encounters ending a dungeon, tuned for a single party.
- **Elite bosses** — high-difficulty, mechanics-heavy fights for skilled parties.
- **World bosses** — massive, timed encounters in designated regions requiring many players; a
  shared-damage, shared-reward model.

## Mechanics

Bosses are defined by legible, escalating mechanics rather than raw stats:

- phases with changing behavior and abilities;
- telegraphed attacks that reward positioning and timing;
- adds, environmental hazards and enrage timers;
- role checks that reward balanced composition (tank/heal/DPS/control).

Boss AI extends the tactical AI model with scripted phase logic (see
[../architecture/AI.md](../architecture/AI.md)).

## World Boss Model

- Spawns on schedules/triggers; visible to the region.
- Shared health pool; contribution tracked per player/guild.
- Rewards scale with contribution, with anti-freeloading and anti-monopoly safeguards.
- Coordinated via guild tools (see [Guilds.md](Guilds.md)).

## Rewards

Exclusive crafting materials, high-tier equipment, hero progression items and cosmetics. Supply is
bounded to protect crafting and market value (see [Economy.md](Economy.md)).

## Related Systems

[Combat.md](Combat.md) · [PvE.md](PvE.md) · [Guilds.md](Guilds.md) · [Events.md](Events.md)
