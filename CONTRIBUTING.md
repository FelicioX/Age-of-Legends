# Contributing to Age of Legends

Thank you for helping build Age of Legends. This guide describes how the team works so that
contributions stay consistent, tested and easy to review.

## Ground Rules

1. **Design before code.** Non-trivial features start with a design note or an update to the
   Game Design Document, reviewed before implementation. See the
   [development process](docs/standards/CodeReview.md).
2. **Everything is tested.** New logic ships with unit tests; systems that cross boundaries ship
   with integration tests. Bug fixes ship with a regression test.
3. **Everything is documented.** Update the relevant docs, the `CHANGELOG.md` and, when a decision
   is made, add an ADR.
4. **Respect module boundaries.** Follow the dependency direction in [ARCHITECTURE.md](ARCHITECTURE.md).
   Do not import "upward".

## Prerequisites

- Node.js **>= 22**, pnpm **>= 9** (run `corepack enable`)
- Docker for local PostgreSQL and Redis

## Workflow

```bash
pnpm install                 # install dependencies
cp .env.example .env         # configure environment
pnpm run infra:up            # start PostgreSQL + Redis
pnpm run dev                 # work in watch mode
```

Before opening a pull request:

```bash
pnpm run check               # format check + lint + typecheck + tests
```

## Branching & Commits

- Branch from `main` using `type/short-description` (e.g. `feat/hero-roster`,
  `fix/snapshot-drift`).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `type(scope): summary`. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`,
  `ci`, `chore`.
- Keep commits focused and buildable.

Full details: [docs/standards/GitWorkflow.md](docs/standards/GitWorkflow.md).

## Pull Requests

- Fill in the PR template.
- Link the related issue or design note.
- Ensure CI is green and coverage does not regress.
- Request review from the owning area (see `.github/CODEOWNERS`).

## Code Standards

All code follows the [Coding Standards](docs/standards/CodingStandards.md),
[Naming Conventions](docs/standards/NamingConvention.md) and the
[Testing guidelines](docs/standards/Testing.md). Linting and formatting are enforced in CI.

## Reporting Issues

Use the issue templates under `.github/ISSUE_TEMPLATE/` for bugs, features, balancing, gameplay,
optimization and technical debt. Security issues must follow [SECURITY.md](SECURITY.md) and must
not be filed as public issues.
