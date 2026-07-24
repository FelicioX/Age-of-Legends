# Economy

## Goals

A living, player-driven economy that stays healthy for years: resources and currency retain value,
trade is meaningful, and no single strategy trivializes progression.

## Structure

- **Resources & materials** — the five core resources and refined materials (see
  [Resources.md](Resources.md)).
- **Currency** — gold as the primary tradable currency; premium currency is cosmetic/convenience
  only (see [Monetization.md](Monetization.md)).
- **Market** — an order-book style player market with listing fees and transaction taxes.
- **Direct trade** — secure player-to-player trades.
- **Auctions** — timed auctions for rare crafted or dropped items.

## Faucets and Sinks

| Faucets (sources)             | Sinks (drains)                                  |
| ----------------------------- | ----------------------------------------------- |
| Production and gathering      | Construction and upgrades                       |
| Quest, event, dungeon rewards | Crafting and refining                           |
| PvP and boss rewards          | Acceleration and convenience                    |
| Market sales                  | Market fees and taxes                           |
|                               | Repairs, reforging, consumables                 |

The market fees/taxes are the primary macro sink that counteracts inflation.

## Inflation Control

- Sinks are sized against measured faucet output; tuning is continuous and data-driven.
- Time-gated content converts real activity into demand, keeping materials scarce.
- Rare outputs are bounded in supply to protect their value.

## Market Design

- Transparent price discovery via visible orders and history.
- Anti-manipulation measures: fees, listing limits and monitoring for abnormal activity.
- Regional/shard markets connected by cross-shard systems where appropriate (see
  [../architecture/Scalability.md](../architecture/Scalability.md)).

## Progression Economy

Costs scale with progression tiers to keep each stage meaningful. Early stages are generous;
later stages emphasize specialization, trade and cooperation.

## Related Systems

[Resources.md](Resources.md) · [Crafting.md](Crafting.md) · [Monetization.md](Monetization.md) ·
[LiveOps.md](LiveOps.md)
