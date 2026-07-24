# Gameplay Reference — Patterns Studied

This note captures the **gameplay and retention patterns** the team examined for the
exploration/base-building/progression genre, and the original Age of Legends interpretation of
each. Only broad, widely used genre patterns are referenced; no protected content is reproduced.

## Genre Patterns Examined

| Pattern                 | Player value                                   | Age of Legends interpretation |
| ----------------------- | ---------------------------------------------- | ----------------------------- |
| Core progression loop   | Constant sense of advancement                  | Explore → gather → build → recruit → fight → unlock ([../../docs/gdd/GameLoop.md](../../docs/gdd/GameLoop.md)) |
| City/base evolution     | Ownership and long-term investment             | Kingdom of upgradable buildings ([../../docs/gdd/Buildings.md](../../docs/gdd/Buildings.md)) |
| Resource management      | Meaningful decisions and pacing                | Five resources with sinks/faucets ([../../docs/gdd/Resources.md](../../docs/gdd/Resources.md)) |
| Team composition        | Expression and mastery                         | Hero archetypes, factions and synergies ([../../docs/gdd/Heroes.md](../../docs/gdd/Heroes.md)) |
| Map discovery           | Curiosity and reward                           | Continuous map with fog-of-war ([../../docs/gdd/World.md](../../docs/gdd/World.md)) |
| Continuous progression  | A reason to return                             | Multi-track progression ([progression.md](progression.md)) |
| Events                  | Freshness and urgency                          | Dynamic + seasonal events ([events.md](events.md)) |
| Social interaction      | Belonging and competition                      | Guilds, trade, world bosses ([guilds.md](guilds.md)) |
| Long-term retention     | Sustained engagement                           | LiveOps and season design ([retention.md](retention.md)) |

## Concrete Systems Observed

A survey of the gameplay reference surfaced the following mechanic categories. Each is a widely used
genre pattern; the table maps it to the **original** Age of Legends system that fulfils the same
player value. No names, art, numbers or protected content are carried over.

| Observed category (generic)              | Age of Legends original system                                   |
| ---------------------------------------- | ---------------------------------------------------------------- |
| Hero collection, star ranks, awakening   | Hero roster with levels + star ranks ([../../docs/gdd/Heroes.md](../../docs/gdd/Heroes.md)) |
| Hero gear / equipment progression        | Crafted equipment, slots, quality/affixes ([../../docs/gdd/Crafting.md](../../docs/gdd/Crafting.md)) |
| Central castle upgrade gating            | Town-hall-gated kingdom tiers ([../../docs/gdd/Buildings.md](../../docs/gdd/Buildings.md)) |
| Buildings & research trees               | Buildings + technology trees ([../../docs/gdd/Technologies.md](../../docs/gdd/Technologies.md)) |
| Troop recruitment / army                 | Barracks recruitment and party/troop capacity ([../../docs/gdd/Buildings.md](../../docs/gdd/Buildings.md)) |
| Cosmetic skins (castle, troops)          | Cosmetic-only monetization ([../../docs/gdd/Monetization.md](../../docs/gdd/Monetization.md)) |
| Large boss encounters                    | World bosses with contribution rewards ([../../docs/gdd/Bosses.md](../../docs/gdd/Bosses.md)) |
| Campaign / tower PvE modes               | Dungeons, expeditions and elite challenges ([../../docs/gdd/PvE.md](../../docs/gdd/PvE.md)) |
| Territorial warfare / server titles      | Territory control and leaderboards ([../../docs/gdd/PvP.md](../../docs/gdd/PvP.md), [../../docs/gdd/Guilds.md](../../docs/gdd/Guilds.md)) |
| Alliance duels / cooperative guild play  | Guild events and cooperative content ([../../docs/gdd/Guilds.md](../../docs/gdd/Guilds.md)) |
| Recurring event calendar (arms-race type)| Dynamic + seasonal event system ([../../docs/gdd/Events.md](../../docs/gdd/Events.md)) |
| Season/kingdom-vs-kingdom cadence        | LiveOps seasons and cross-shard events ([../../docs/gdd/LiveOps.md](../../docs/gdd/LiveOps.md)) |
| Premium currency + F2P economy           | Ethical, non-pay-to-win economy ([../../docs/gdd/Economy.md](../../docs/gdd/Economy.md)) |

> A black-box **technical teardown** of a shipping build of the reference (package metadata and
> structure only, no protected content) is recorded in [technical-teardown.md](technical-teardown.md).

**Key retention insight:** the strongest driver observed is a **dense LiveOps cadence** — a weekly
event calendar layered over long seasonal campaigns and recurring cooperative/competitive events.
Age of Legends adopts this cadence philosophy with entirely original content
([retention.md](retention.md)).

## Guiding Interpretation

The team keeps the **feel** these patterns produce — steady progress, ownership, discovery and
social depth — while designing every system, name, number and piece of content originally. Detailed
analyses follow in the sibling notes.
