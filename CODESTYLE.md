# Code Style

This file is a quick reference. The authoritative style guide is
[docs/standards/CodingStandards.md](docs/standards/CodingStandards.md), and naming rules live in
[docs/standards/NamingConvention.md](docs/standards/NamingConvention.md).

## Formatting

- Prettier owns formatting. Do not hand-format; run `pnpm run format`.
- 100-column soft limit, 2-space indentation, single quotes, semicolons, trailing commas.

## TypeScript

- `strict` mode is mandatory, including `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`.
- Prefer `type` for shapes and unions; use `interface` for extendable public contracts.
- No `any`. Use `unknown` and narrow. `null!` assertions are disallowed outside tests.
- Use branded types for identifiers (see `shared/src/types`).
- Prefer `readonly` and immutability for shared data.

## Naming

- `PascalCase` for types, classes, components and enums.
- `camelCase` for variables, functions and members.
- `SCREAMING_SNAKE_CASE` for module-level constants.
- Files: `kebab-case.ts`; React components: `PascalCase.tsx`.

## Imports

- Use inline type imports: `import { type Foo, bar } from './x'`.
- Respect package boundaries; never import "upward" in the dependency graph.

## Comments

- Comments explain _why_, not _what_. Document non-obvious business rules and technical decisions.
- No decorative banners, attributions or generated-code markers.

## Tests

- Co-locate unit tests as `*.test.ts` next to the code under test.
- Deterministic gameplay logic is tested without a renderer or network.
