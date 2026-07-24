# Combat

## Model

Real-time, party-based combat resolved by the authoritative simulation. Each hero acts on a cadence
derived from Speed, using basic attacks and skills governed by cooldowns and a resource where
applicable. The player directs targeting, skill timing and formation; the simulation resolves
outcomes deterministically.

## Core Concepts

- **Skills:** basic, active, passive and ultimate. Active/ultimate skills have cooldowns; ultimates
  charge through combat.
- **Cooldowns:** every active ability is gated by a cooldown, tuned for rhythm and counterplay.
- **Buffs / Debuffs:** timed status effects (e.g. haste, shield, weaken, burn, stun) with clear
  stacking and refresh rules.
- **Threat:** enemies choose targets by accumulated threat; vanguards generate threat to protect
  allies. Threat is legible and manipulable.
- **Damage types:** physical and magical, mitigated by Defense and resistances respectively.
- **Critical hits:** chance-based multipliers, tunable per hero and via equipment.

## Formation

Heroes occupy front/back positions. Position affects threat priority, ability reach and
vulnerability, making formation a meaningful pre-combat decision.

## Enemy AI

Enemies use tactical AI (see [../architecture/AI.md](../architecture/AI.md)): target selection by
threat and role, ability usage by utility scoring, and coordinated behaviors for elites and bosses.
AI difficulty scales by encounter tier, not by unfair information.

## Encounter Types

- **Solo / party PvE** — dungeons, patrols, quests.
- **World encounters** — roaming enemies and dynamic events.
- **World bosses** — large, multi-party, mechanics-driven fights ([Bosses.md](Bosses.md)).
- **PvP** — structured competitive combat ([PvP.md](PvP.md)).

## Balancing

- Roles are balanced around clear strengths and weaknesses; no archetype is strictly dominant.
- New content is validated against the balance model before release; live data feeds tuning.
- Power growth is bounded so that skill and composition remain decisive.

Detail on tuning process: [../roadmap/Backlog.md](../roadmap/Backlog.md) and the balancing issue
template.

## Determinism

Combat resolution is part of the deterministic simulation core: identical inputs and seed yield
identical outcomes, enabling replay, testing and server authority. See
[../architecture/ECS.md](../architecture/ECS.md).
