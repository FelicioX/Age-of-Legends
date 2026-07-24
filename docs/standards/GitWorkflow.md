# Git Workflow

## Branching

- `main` is always releasable and protected. No direct pushes.
- Work happens on short-lived branches named `type/short-description`:
  - `feat/hero-roster`, `fix/snapshot-drift`, `docs/economy-sinks`, `refactor/ecs-storage`,
    `test/combat-determinism`, `chore/ci-cache`.
- Rebase on `main` before opening a pull request; keep history clean.

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short imperative summary

Optional body explaining what and why.

Optional footer (references, breaking changes).
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `chore`.

Guidelines:

- One logical change per commit; keep each commit buildable.
- Reference issues where relevant (`Closes #123`).
- Write clear, professional messages describing intent.

## Pull Requests

- Open against `main` using the PR template.
- CI must be green: format, lint, typecheck and tests.
- Coverage must not regress.
- Request review from the owning area (`.github/CODEOWNERS`).
- Squash or rebase-merge to keep `main` linear.

## Releases & Versioning

- Semantic Versioning (`MAJOR.MINOR.PATCH`).
- Release notes are derived from the `CHANGELOG.md`.
- Tags follow `vX.Y.Z`; releases are automated (see the release workflow).

## Hooks

- Pre-commit runs format and lint on staged files.
- Pre-push runs typecheck and the affected tests.
- Hooks are managed with Husky and must not be bypassed without cause.
