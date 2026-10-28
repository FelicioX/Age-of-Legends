# Age of Legends — Playable Prototype

A **self-contained, no-build** slice of Age of Legends that runs entirely in the browser. It needs
no Node.js, no server and no installation — just open the file.

## How to Run

1. Open `index.html` in a modern browser (double-click it, or drag it into a browser window).
2. That's it. The game starts immediately and autosaves to your browser's local storage.

> Tip: for the smoothest experience use a recent Chrome, Edge or Firefox. Progress is saved per
> browser on this machine.

## What It Demonstrates

The prototype is a complete client-side game loop. Online play, monetization and art are
**simulated locally** — there is no backend, no payment and no imported asset.

### Kingdom and world

- **Kingdom & resources** — five resources (wood, stone, iron, food, gold) produced over time by
  upgradable buildings. The **Town Hall gates every other building's tier**, exactly as specified
  in [../docs/gdd/Buildings.md](../docs/gdd/Buildings.md).
- **Build queue** — a limited pool of builders works the queue, shown as a strip over the kingdom.
- **Exploration** — a procedurally generated island world with biomes and **fog of war** that
  reveals as your party travels ([../docs/gdd/World.md](../docs/gdd/World.md)).
- **Gathering** — move your party onto resource nodes to harvest bonus resources.
- **Day/night cycle** — a global clock tints the world and advances the day counter.

### Heroes and combat

- **Roster** — twelve heroes across five classes (Vanguard, Ranger, Mystic, Warden, Artificer) and
  four rarities, each with a basic/passive/ultimate skill trio. Passives modify real stats.
- **Factions and synergy** — three original factions (Dawnward Pact, Wildkin Circle, Duskbound
  Covenant). Fielding two, three or four of a faction grants +8%, +14% or +20%.
- **Formation** — front and back lines, honored by the battle resolver.
- **Battle scene** — a drawn, canvas-rendered fight with ATB and energy, role ultimates,
  projectiles, area effects, healing, floating damage, screen shake, hitstop, particles and
  1×/2×/3× speed controls.
- **Progression** — star ascension up to 6★, four equipment slots (weapon, armor, boots, trinket),
  an inventory and gear drops.

### Progression and live-service loop

- **Campaign** — "The Ironvale Marches", twelve stages with three bosses, plus idle accrual
  (8-hour cap) and stage sweep.
- **Onboarding** — a four-step scripted first session with a free rare hero and a first-victory
  bonus.
- **Dailies** — a seven-day login track, five rotating missions and an activity meter with three
  chests.
- **Summon** — published odds (3% legendary, 12% epic, 30% rare, 55% common) with pity at 10 pulls
  for epic and 60 for legendary; duplicates convert to shards.
- **Arena** — asynchronous PvP on a seeded ladder across five leagues (Bronze to Diamond), with
  rating and a daily attempt allowance.
- **Guild** — donations, guild coins, a shop, a roster and three research techs (Might, Vigor,
  Prosperity) whose bonuses apply to real stats and production.
- **Achievements** — eight goals with claimable rewards.
- **Shop and season** — a daily gift, three bundles and a ten-tier season pass.
- **Events** — four rotating live events: Bounty Weekend, Gold Rush, Arena Fervor and Fate
  Festival.
- **Saves** — three independent slots with export/import and migration of legacy saves.

### Presentation

- **Procedural art** — hero portraits are drawn on canvas at runtime. No asset files, all original.
- **Synthesized audio** — sound effects and a music loop generated through the Web Audio API, with
  a persisted mute setting. Degrades to silence where the API is unavailable.

## How It Mirrors the Real Architecture

Although this track ships as plain browser scripts with no build step, it deliberately reflects
the engineering of the full project:

- A **deterministic, seeded RNG** (the same `mulberry32` algorithm used in `@aol/shared`).
- A **fixed-timestep simulation loop** at 20 Hz with an accumulator and a spiral-of-death guard,
  mirroring `@aol/engine`'s `FixedStepLoop`.
- A clean split between **simulation** (`step`) and **rendering** (`render`), as the real client
  keeps rules out of the renderer.

## Layout

Classic scripts under a single global `AOL` namespace, loaded in dependency order by `index.html`:

| File             | Responsibility                                                               |
| ---------------- | ---------------------------------------------------------------------------- |
| `data.js`        | Content and configuration: RNG, resources, buildings, heroes, enemies, costs |
| `art.js`         | Procedural hero portraits drawn on canvas                                    |
| `audio.js`       | Web Audio synthesis: sound effects, music loop, mute                         |
| `render.js`      | Isometric kingdom renderer: init/resize/render, pan and selection            |
| `battle.js`      | The battle scene: units, ATB, ultimates, projectiles and effects             |
| `game.js`        | Game logic and UI: state, fixed-step simulation, screens, saves              |
| `styles.css`     | All presentation                                                             |
| `smoke-test.cjs` | Headless test harness                                                        |

Asset URLs carry a `?v=N` cache-busting query so updates always load. Bump it when you change a
file.

## Testing

```bash
pnpm run smoke:playable
```

Boots the prototype under Node with DOM and canvas stubs and asserts the behavior of its systems —
roster integrity, passives and synergy, gacha pity, ascension math, equipment, arena laddering,
guild techs, achievements, season tiers and event rotation. The browser-only slice is held to the
same quality gate as the typed packages.

## Scope & Next Steps

This prototype validates **game design**, not architecture. Its systems live in plain scripts,
isolated from the typed packages — closing that split by folding the rules into `game/` and
`engine/` is tracked in [../TASKS.md](../TASKS.md).

Authoritative multiplayer, real persistence, the player market and world bosses are delivered by
the milestones in [../docs/roadmap/Milestones.md](../docs/roadmap/Milestones.md), built on the
packages under `shared/`, `engine/`, `game/`, `server/` and `client/`.
