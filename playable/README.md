# Age of Legends — Playable Prototype

A **self-contained, no-build** slice of Age of Legends that runs entirely in the browser. It needs
no Node.js, no server and no installation — just open the file.

## How to Run

1. Open `index.html` in a modern browser (double-click it, or drag it into a browser window).
2. That's it. The game starts immediately and autosaves to your browser's local storage.

> Tip: for the smoothest experience use a recent Chrome, Edge or Firefox. Progress is saved per
> browser on this machine.

## What It Demonstrates

This prototype exercises the **core loop** described in the design documents:

- **Kingdom & resources** — five resources (wood, stone, iron, food, gold) produced over time by
  upgradable buildings. The **Town Hall gates every other building's tier**, exactly as specified in
  [../docs/gdd/Buildings.md](../docs/gdd/Buildings.md).
- **Exploration** — a procedurally generated, continuous world with biomes and **fog of war** that
  reveals as your party travels ([../docs/gdd/World.md](../docs/gdd/World.md)).
- **Gathering** — move your party onto resource nodes to harvest bonus resources.
- **PvE combat** — reach enemy camps to resolve battles; winning grants loot and levels up your
  party's power, unfelling tougher camps further from home.
- **Day/night cycle** — a global clock tints the world and advances the day counter.

## How It Mirrors the Real Architecture

Although this is a single vanilla-JavaScript file, it deliberately reflects the engineering of the
full project:

- A **deterministic, seeded RNG** (the same `mulberry32` algorithm used in `@aol/shared`).
- A **fixed-timestep simulation loop** at 20 Hz with an accumulator and a spiral-of-death guard,
  mirroring `@aol/engine`'s `FixedStepLoop`.
- A clean split between **simulation** (`step`) and **rendering** (`render`), as the real client
  keeps rules out of the renderer.

## Controls

- **Click/tap the map** to send your party to that location.
- **Upgrade buttons** in the Kingdom panel spend resources to raise production.
- **Save** writes your progress; **New Game** starts a fresh seed.

## Scope & Next Steps

This prototype is a vertical taste of the loop, not the full game. Heroes, crafting, guilds, the
market, world bosses and authoritative multiplayer are delivered by the milestones in
[../docs/roadmap/Milestones.md](../docs/roadmap/Milestones.md), built on the typed packages under
`shared/`, `engine/`, `game/`, `server/` and `client/`.
