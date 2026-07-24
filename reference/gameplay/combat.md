# Combat — Analysis & Adaptation

## Pattern

Party-based genre combat rewards **composition and timing**: distinct roles, cooldown-gated
abilities, and status effects turn fights into legible puzzles rather than stat checks.

## Age of Legends Interpretation

See [../../docs/gdd/Combat.md](../../docs/gdd/Combat.md):

- **Roles** via archetypes (vanguard/ranger/mystic/warden/artificer).
- **Cooldowns, buffs/debuffs and threat** as the core tactical vocabulary.
- **Formation** (front/back) as a meaningful pre-combat decision.
- **Deterministic resolution** so combat is testable and server-authoritative.

## Balance Guardrails

- Every role has clear strengths and weaknesses; none is strictly dominant.
- New content is validated against the balance model before release; live data feeds tuning.
- Power growth is bounded to keep skill and composition decisive.

## Why It Is Original

Heroes, skills, numbers, status effects and AI behaviors are designed for Age of Legends; only the
role/cooldown/threat framework is a genre convention.
