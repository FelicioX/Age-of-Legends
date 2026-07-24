# Design Principles

Concrete rules of thumb that translate the [pillars](002_GamePillars.md) into everyday design and
engineering decisions.

## Gameplay Design

- **Clarity over cleverness.** The player should understand what happened and why.
- **Meaningful choices.** Options should have distinct, legible trade-offs — no dominant strategy.
- **Reward the journey.** Progression is a steady stream of small, satisfying wins punctuated by
  memorable milestones.
- **Respect the player's time.** Automate busywork; front-load fun; avoid artificial friction.
- **No pay-to-win.** Purchases save time or add cosmetics; they never sell power.
- **Fail forward.** Setbacks teach and re-motivate; they do not erase meaningful progress.

## Economy Design

- Every faucet (source) has a matching sink (drain). Currency and materials must have somewhere to
  go, or inflation erodes value.
- Player agency drives the economy; the market is a real, observable system.
- Progression gates are tuned with data, not guesswork.

## Systems & Engineering

- **Determinism where it matters.** Gameplay simulation is deterministic and reproducible.
- **Server is the source of truth.** The client presents; it does not decide.
- **Compose, don't inherit.** Behavior is built from components and systems (ECS).
- **Data-driven content.** Heroes, buildings, items and events are data, not code, wherever
  possible — enabling tooling and rapid iteration.
- **Fail loudly in development, gracefully in production.**
- **Measure before optimizing.** Performance work follows profiling, not intuition.

## Accessibility & UX

- Input-agnostic: touch, mouse and keyboard are all first-class.
- Readable at a glance: strong visual hierarchy, colorblind-safe cues, scalable text.
- Progressive disclosure: complexity is revealed as the player is ready for it.
