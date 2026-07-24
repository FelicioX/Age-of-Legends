# Testing Standards

Testing is not optional. Determinism makes gameplay testable without a renderer or a network, and
we exploit that fully.

## Test Types

- **Unit** — pure functions and ECS systems in isolation. Fast, deterministic, co-located as
  `*.test.ts`.
- **Integration** — multiple systems or a package boundary together (e.g. simulation + protocol).
- **Networking** — protocol encode/decode, prediction/reconciliation and interest management.
- **Gameplay** — golden-master determinism: a seed plus a scripted intent stream yields a fixed end
  state.
- **Load / Stress** — capacity and stability under population (`tests/load`, `tests/stress`).
- **E2E** — critical player flows through the real client/server (`tests/e2e`).

## Tooling

- [Vitest](https://vitest.dev/) is the test runner across packages, with coverage via
  `@vitest/coverage-v8`.
- Tests run in CI on every pull request; coverage is reported and must not regress.

## Conventions

- Co-locate unit tests next to the code: `system-scheduler.ts` → `system-scheduler.test.ts`.
- Name tests by behavior: `describe('MovementSystem', () => it('advances position by velocity'))`.
- Arrange–Act–Assert; one behavior per test where practical.
- No sleeps or wall-clock dependence; drive time via the fixed step and seeded RNG.
- Tests must be deterministic and independent (no shared mutable state or ordering dependence).

## Determinism Tests

Golden-master tests are the backbone of gameplay confidence:

1. Construct a world with a fixed seed.
2. Apply a scripted sequence of intents over N steps.
3. Assert the serialized end state matches a stored golden snapshot.

A change to a golden snapshot must be intentional and reviewed.

## Coverage Targets

- Shared/engine/game logic: high coverage (target ≥ 90% of statements/branches for core logic).
- Server handlers: cover validation, authority and error paths.
- Coverage is a guardrail, not a goal; meaningful assertions matter more than the number.

## What to Test for Bug Fixes

Every bug fix adds a regression test that fails before the fix and passes after.
