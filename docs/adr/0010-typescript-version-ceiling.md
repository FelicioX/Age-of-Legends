# ADR-0010: Hold TypeScript at 6.x until the lint toolchain supports 7

- **Status:** Accepted
- **Date:** 2026-10-28
- **Deciders:** Technical Direction
- **Related:** [ADR-0002](0002-technology-stack.md), [ADR-0003](0003-monorepo-pnpm-turborepo.md)

## Context

TypeScript 7.0 is released and is what the `typescript` package resolves to by default. The
project's lint gate runs `typescript-eslint`, which reads the TypeScript compiler API directly in
order to provide type-aware rules. As of its current release (8.72.1), `typescript-eslint` declares
a peer range of `typescript: ">=4.8.4 <6.1.0"` and refuses to start outside it:

```
Error: typescript-eslint does not support TS 7.0.
```

A grouped dependency update that raised `typescript` to 7.0.2 therefore made `pnpm lint` abort
across every workspace, failing CI. The failure is not a defect in this repository's code — it is
an unsupported pairing of two tools that the automated updater has no way to detect, and it will
recur on every update cycle until the upstream support lands.

A second, quieter version skew applies to `@types/node`. The runtime is pinned to Node 22 in both
`.nvmrc` and the CI workflow, so accepting `@types/node` 26 would describe APIs that do not exist
in the runtime the code actually executes on.

Upstream tracking: https://github.com/typescript-eslint/typescript-eslint/issues/10940

## Decision

Hold `typescript` at the **6.x** line — the newest line `typescript-eslint` supports — and hold
`@types/node` at the **22.x** line, matching the pinned Node runtime. Encode both constraints as
`ignore` rules in `.github/dependabot.yml` so the automated updater stops proposing the broken
pairing, and annotate each rule with the condition that lifts it.

## Options Considered

1. **Hold TypeScript at 6.x and record the constraint (chosen)** — the lint gate keeps its
   type-aware rules, CI stays green, and the ceiling is visible in the repository rather than
   rediscovered through a red build every week.
2. **Take TypeScript 7 and drop type-aware linting** — would surrender the rules that catch
   floating promises and unsafe `any` flow, which is a larger loss than the compiler upgrade is a
   gain.
3. **Take TypeScript 7 and run `typescript-eslint` against a side-by-side TypeScript 6 API** —
   upstream describes this as possible, but it means two compiler versions resolved in one
   workspace, with the lint gate and the build disagreeing about the language. Too much standing
   complexity for a temporary gap.
4. **Leave the updater to repropose it and close the pull request each time** — recurring manual
   work and a permanently red dependency queue, which trains the team to ignore it.

## Consequences

- **Positive:** the quality gate stays complete and green; the constraint is explicit and
  discoverable; the automated updater keeps working for every other dependency.
- **Trade-offs:** the project forgoes TypeScript 7 language and performance improvements until the
  lint toolchain catches up, and the pin is a standing item that must be revisited rather than
  forgotten.
- **Follow-ups:** when `typescript-eslint` publishes support for TypeScript >= 7, remove the
  `typescript` entry from the `ignore` list, take the upgrade and supersede this ADR. Remove the
  `@types/node` entry as part of a deliberate Node runtime upgrade, changing `.nvmrc`, the CI
  workflow and the `engines` field together.

> ADRs are immutable once accepted. To change a decision, create a new ADR that supersedes this one
> and update [DECISIONS.md](../../DECISIONS.md).
