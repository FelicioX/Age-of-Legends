# Economy — Analysis & Adaptation

## Pattern

Healthy genre economies balance **faucets** (sources) against **sinks** (drains) and give players
agency through trade. Time-gated activity converts play into demand, keeping materials valuable.

## Age of Legends Interpretation

See [../../docs/gdd/Economy.md](../../docs/gdd/Economy.md):

- **Faucets:** production, gathering, quest/event/boss rewards.
- **Sinks:** construction, upgrades, crafting, acceleration, market fees/taxes, repairs, reforging.
- **Agency:** an order-book player market plus direct trade and auctions.
- **Macro sink:** market fees/taxes counter inflation.

## Design Guardrails

- Sinks are sized against measured faucet output; tuning is continuous and data-driven.
- Rare outputs are bounded in supply to protect value.
- Premium currency never bypasses sinks in a way that inflates the economy
  ([../../docs/gdd/Monetization.md](../../docs/gdd/Monetization.md)).

## Why It Is Original

The resource set, recipes, fee structures, curves and market rules are Age of Legends' own; only the
faucet/sink discipline is a genre principle.
