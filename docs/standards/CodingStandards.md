# Coding Standards

Authoritative coding standards for Age of Legends. Formatting and linting are enforced in CI; this
document covers the conventions tools cannot fully capture.

## Language & Strictness

- TypeScript in `strict` mode across all packages, including `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride` and `noUnused*`.
- No `any`. Use `unknown` and narrow. Avoid non-null assertions (`!`) outside tests.
- Prefer `readonly` and immutable data for anything shared across systems or the network.

## Types

- Use branded types for identifiers (`EntityId`, `PlayerId`, etc.) — see `shared/src/types`.
- Prefer `type` aliases for data shapes and unions; use `interface` for extendable public
  contracts.
- Model illegal states as unrepresentable where practical (discriminated unions over boolean flags).

## Modules & Boundaries

- Respect the dependency graph in [../../ARCHITECTURE.md](../../ARCHITECTURE.md); never import
  "upward".
- Each module has a single, well-named responsibility and a small public surface (`index.ts`).
- No circular dependencies.

## Functions & Systems

- Keep functions small and focused; prefer pure functions for gameplay logic.
- ECS systems are deterministic: no wall-clock time, no unscoped randomness, stable iteration.
- Side effects (I/O) live in `server`/`client`, never in `game`.

## Errors

- Fail loudly in development; degrade gracefully in production.
- Validate at trust boundaries (protocol) and assert internal invariants.
- Do not swallow errors silently; log with context.

## Comments & Documentation

- Comments explain **why**, not **what**. Document non-obvious business rules and decisions.
- No decorative banners, no attributions, no generated-code markers.
- Public APIs carry concise TSDoc.

## Imports & Formatting

- Inline type imports: `import { type Foo, bar } from './x'`.
- Prettier owns formatting (100 cols, single quotes, semicolons, trailing commas). Do not
  hand-format.

## Performance

- Measure before optimizing. Prefer clear code; optimize hot paths identified by profiling.
- Be mindful of allocations in the tick loop and render loop.

## Testing

- New logic ships with unit tests; boundary-crossing behavior ships with integration tests.
- Bug fixes ship with a regression test. See [Testing.md](Testing.md).

## Dependencies

- Add dependencies deliberately. Prefer the standard library and existing utilities.
- Every new dependency is justified in review and, if architecturally significant, in an ADR.
