# Architecture Notes

Working notes on how examined engineering patterns are realized — and deliberately diverge — in Age
of Legends.

## Divergences and Original Choices

- **Monorepo of typed packages.** Rather than a single application, Age of Legends is a set of
  layered packages (`shared`, `engine`, `game`, `server`, `client`) with an enforced dependency
  direction. This makes the simulation core reusable and the boundaries explicit.
- **ECS over object hierarchies.** Composition via components/systems is chosen for cache-friendly,
  data-driven, testable gameplay — an intentional departure from inheritance-heavy entity models.
- **Interest management from day one.** Bandwidth and CPU scale with player perception, not world
  size — a prerequisite for the target population.
- **Sharded world.** The map is partitioned for horizontal scale, with cross-shard coordination for
  global systems.

## Open Questions Tracked

- Exact component storage layout (archetype vs sparse-set) — to be validated by benchmarks in
  milestone 1.
- Snapshot delta strategy and compression thresholds — to be tuned in milestone 2.
- Re-sharding policy for hot regions — deferred to the scalability work.

## References

- [engineering-reference.md](engineering-reference.md)
- [../../docs/architecture/](../../docs/architecture/)
- [../../docs/adr/](../../docs/adr/)
