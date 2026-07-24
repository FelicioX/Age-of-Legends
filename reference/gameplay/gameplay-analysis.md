# Gameplay Analysis

An analysis of *why* the studied genre patterns work, so Age of Legends can reproduce the
underlying player value with original systems.

## Why the Loop Works

The core loop succeeds because each stage produces the input to the next and each produces a small
reward: exploration yields resources, resources yield buildings, buildings yield power, power yields
access to more exploration. There is always a visible next step and a recent win. Age of Legends
preserves this causal chain (see [../../docs/gdd/GameLoop.md](../../docs/gdd/GameLoop.md)).

## Why Base Building Retains

An upgradable home base creates ownership and a long investment horizon. Time-gated construction
converts absence into anticipation and gives returning players an immediate, satisfying action.
Age of Legends' kingdom realizes this while remaining fair (protected resources, no pay-to-win
acceleration of power).

## Why Team Composition Engages

Distinct roles and synergies turn combat into a puzzle of expression and mastery, not a stat check.
Age of Legends' archetypes and faction synergies are tuned so no single line-up dominates
(see [combat.md](combat.md)).

## Why the Social Layer Sustains

Interdependence — trade, guilds, shared events — converts solo play into collective story and gives
players reasons to return that are external to their own progress. Age of Legends leans into this
with guild progression and contribution-based world bosses.

## Risks Observed (and Our Guardrails)

| Risk in the genre                     | Our guardrail                                            |
| ------------------------------------- | -------------------------------------------------------- |
| Pay-to-win eroding fairness           | Hard non-power monetization rule ([../../docs/gdd/Monetization.md](../../docs/gdd/Monetization.md)) |
| Grind fatigue                         | Multi-track progression and generous early pacing        |
| Economic inflation                    | Deliberate sinks and data-driven tuning ([economy.md](economy.md)) |
| Snowballing / new-player gap          | Matchmaking, protection windows, catch-up mechanics      |
| Content burnout                       | LiveOps cadence and dynamic events ([retention.md](retention.md)) |
