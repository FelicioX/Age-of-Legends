# Game Loop

## Primary Loop

```
        ┌───────────────────────────────────────────────┐
        ▼                                               │
   Explore ─▶ Gather ─▶ Build/Upgrade ─▶ Recruit/Train ─▶ Fight ─▶ Rewards
        ▲                                                        │
        └────────────────────── Unlock new frontier ◀───────────┘
```

Every stage feeds the next: exploration reveals resources; resources fund building; buildings
unlock heroes and research; stronger heroes clear harder content; rewards open new frontiers to
explore.

## Session Loops

The game is designed for sessions of any length.

- **Micro (1–5 min):** collect production, dispatch a gathering party, claim daily rewards, run one
  quick encounter.
- **Short (10–20 min):** clear a dungeon, progress a quest chain, manage the market, contribute to
  a guild goal.
- **Long (30+ min):** coordinate a world boss, run competitive PvP, plan and execute a research or
  build push.

## Pacing Philosophy

- **Front-load fun.** New players fight and explore within the first minutes; management depth is
  revealed progressively.
- **Always a next step.** Multiple progression tracks guarantee a meaningful goal at any time.
- **Idle-friendly, not idle-only.** Kingdoms produce while offline, but active play is always more
  rewarding and more fun.
- **Cadence of milestones.** Frequent small rewards, periodic memorable unlocks (new region, hero
  star-up, building tier, technology).

## Retention Hooks

- Daily and weekly goals with escalating rewards.
- Time-gated production and construction that reward returning.
- Guild commitments and scheduled cooperative events.
- Seasonal LiveOps content and cosmetic chases.

Balance targets for pacing are tuned with telemetry; see [LiveOps.md](LiveOps.md) and
[Economy.md](Economy.md).
