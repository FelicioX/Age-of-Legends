# Gameplay Reference — Technical Teardown

This note records **engineering intelligence** gathered from a publicly distributed Android build of
the gameplay reference (an installable app package). Only **structural metadata** was examined —
package manifest, native/managed module layout, asset-pipeline bookkeeping and permission set. **No
protected content** (art, audio, text, balance tables, source or proprietary schemas) was extracted,
reproduced or adapted. Each observation is mapped to an original Age of Legends decision.

## Method & Scope

The package was inspected as an archive: its manifest, the names/sizes of managed modules, the
categories of bundled schema files, the asset-delivery bookkeeping files and the requested
permissions. This is black-box competitive analysis of *how a shipping live-service title is
engineered*, not a study of its content.

## Observations → Age of Legends Decisions

| Observation (shipping build)                                              | Age of Legends decision (original)                                                                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Native mobile client built on a mainstream engine with managed assemblies | AoL targets **web + mobile from one TypeScript codebase** (no native engine) — see [ADR-0002](../../docs/adr/0002-technology-stack.md). Same goal (one client, many platforms), different, web-first means. |
| Game logic concentrated behind an explicit **interface module** boundary  | AoL enforces boundaries via **typed packages** (`shared`/`engine`/`game`/`client`/`server`) and project references — [../../ARCHITECTURE.md](../../ARCHITECTURE.md). |
| JSON used for configuration/serialization; compression for payloads       | AoL uses **data-driven content** (JSON-authorable) and **compact binary snapshots with delta encoding** — [../../docs/architecture/Networking.md](../../docs/architecture/Networking.md). |
| **Structured client telemetry** via a dedicated event/analytics schema    | AoL plans a **first-class telemetry pipeline** feeding LiveOps and balance — [../../docs/gdd/LiveOps.md](../../docs/gdd/LiveOps.md). |
| **Incremental asset delivery** with versioned subpackages + CRC/MD5 checks | AoL adopts **versioned, integrity-checked content delivery** as content grows; the protocol is versioned and negotiated — [../../docs/architecture/Networking.md](../../docs/architecture/Networking.md), [../../docs/roadmap/Releases.md](../../docs/roadmap/Releases.md). |
| Permission set implies **IAP billing, push notifications, background sync, install-referrer attribution, multi-store distribution** | AoL's live-service posture: **ethical IAP** ([../../docs/gdd/Monetization.md](../../docs/gdd/Monetization.md)), retention notifications and events ([../../docs/gdd/Events.md](../../docs/gdd/Events.md)), authoritative background world simulation ([../../docs/architecture/Server.md](../../docs/architecture/Server.md)). |
| **~24 localizations** shipped                                             | AoL treats **localization as first-class** from the start (client `localization/`, shared string tables). |

## Key Engineering Takeaways

1. **A live-service MMORPG is an operations platform, not just a game client.** The build's weight is
   in delivery, telemetry, monetization and globalization plumbing. AoL's architecture budgets for
   these explicitly rather than bolting them on later.
2. **A hard module boundary keeps a huge game logic base maintainable.** The reference isolates game
   logic behind an interface layer; AoL achieves the same discipline with enforced package
   boundaries and a shared deterministic core.
3. **Incremental, integrity-checked content delivery is essential at scale.** Versioned subpackages
   with checksums inform AoL's content-delivery and release strategy.
4. **Instrument everything.** A dedicated analytics/event pipeline is standard practice for
   data-driven LiveOps; AoL commits to this from milestone planning.

## Compliance

This teardown examined only package structure and metadata. No characters, art, audio, text, UI,
balance data, code or proprietary schemas were copied or adapted. All Age of Legends content remains
original. See [../README.md](../README.md) and [../decisions/adaptation-log.md](../decisions/adaptation-log.md).
