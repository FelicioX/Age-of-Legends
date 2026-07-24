# Project Overview

**Age of Legends** is a next-generation MMORPG featuring persistent worlds, kingdom building,
exploration, strategic combat and large-scale multiplayer.

## At a Glance

| Field            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Genre            | MMORPG — exploration, base building, persistent progression      |
| Platforms        | Web browser and mobile (single codebase)                         |
| Perspective      | Top-down 2D                                                      |
| Monetization     | Ethical, non-pay-to-win (cosmetics, convenience, season passes)  |
| Server model     | Authoritative, sharded, horizontally scalable                    |
| Status           | Foundation phase (Milestone 0)                                   |

## Core Pillars

1. **Gameplay first** — every mechanic must be fun before it is complex.
2. **Clean architecture** — modular, testable, maintainable systems.
3. **A living, persistent world** — the world never feels static.
4. **Scalability** — every decision assumes a large concurrent population.
5. **Social experience** — cooperation and competition are first-class.
6. **Intelligent NPCs** — believable, reactive AI behavior.
7. **Long service life** — designed for years of continuous content.

## Player Fantasy

Rise from a single outpost to a legendary kingdom. Explore an untamed continent, gather and refine
its riches, recruit a roster of distinct heroes, and lead them through cooperative raids, dynamic
world events and guild warfare — in a world that persists and evolves whether or not you are
online.

## Design & Engineering References

Age of Legends draws on two independent references, kept strictly separate:

- **Engineering reference** — informs *how the game is built*: architecture, the single simulation
  core, authoritative networking, entity management and testing discipline.
- **Gameplay reference** — informs *how the game feels to play*: the progression loop, pacing,
  exploration, city evolution, team composition, events and long-term retention.

Neither reference contributes any protected content. All characters, art, UI, text, names, story,
audio and assets are original to Age of Legends. The study of these references and the original
adaptations made are documented under [reference/](reference/).

## Documentation Map

- Vision: [docs/vision/](docs/vision/)
- Game Design Document: [docs/gdd/000_GDD.md](docs/gdd/000_GDD.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md) and [docs/architecture/](docs/architecture/)
- Roadmap & milestones: [ROADMAP.md](ROADMAP.md), [docs/roadmap/](docs/roadmap/)
- Standards: [docs/standards/](docs/standards/)
- Decisions: [DECISIONS.md](DECISIONS.md), [docs/adr/](docs/adr/)
