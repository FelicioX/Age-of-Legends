# Changelog

All notable changes to Age of Legends are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Monorepo foundation: pnpm workspaces, Turborepo, TypeScript project references, ESLint (flat
  config), Prettier and EditorConfig.
- Containerized local infrastructure via Docker Compose (PostgreSQL 17, Redis 7).
- Complete documentation set: game vision, Game Design Document, architecture overview,
  engineering standards, roadmap and initial Architecture Decision Records.
- Reference study notes separating engineering inspiration from gameplay inspiration and recording
  the original adaptations made for Age of Legends.
- `shared` package: branded ID types, deterministic math (vectors, scalars, seeded RNG, hashing),
  global constants, the versioned client/server protocol and its validation schemas, with unit
  tests.
- Buildable skeletons for the `engine`, `game`, `server` and `client` packages.
- Continuous integration workflows and contribution templates.
- Self-contained, no-build playable prototype under `playable/` demonstrating the core loop
  (resource production, Town-Hall-gated kingdom upgrades, procedural world with fog of war,
  gathering and PvE camp battles) with a deterministic seeded RNG and fixed-timestep loop.
- Reference study notes enriched with concrete observations from the engineering and gameplay
  references, each mapped to an original Age of Legends system.

## [0.1.0] — Foundation

Initial repository scaffolding. Establishes the engineering baseline for milestone-based
development. No player-facing gameplay yet.
