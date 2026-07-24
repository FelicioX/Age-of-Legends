# Releases

## Versioning

Age of Legends follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

- **MAJOR** — incompatible protocol/save changes or major product shifts.
- **MINOR** — backward-compatible features and content.
- **PATCH** — backward-compatible fixes.

Pre-1.0, `0.x` minor bumps track milestone completion.

## Release Types

- **Milestone releases (pre-1.0):** cut when a milestone's acceptance criteria pass.
- **Content updates (post-1.0):** regular LiveOps drops (events, seasons, balance).
- **Hotfixes:** targeted patches for critical issues.

## Process

1. Ensure `main` is green (CI passing, coverage stable).
2. Finalize the `CHANGELOG.md` `[Unreleased]` section into a versioned entry.
3. Tag `vX.Y.Z`; the release workflow builds artifacts and publishes notes.
4. Deploy per the deployment runbook (see `infrastructure/` and `scripts/deploy`).

## Release Notes

Release notes are generated from the `CHANGELOG.md`, grouped by Added/Changed/Fixed/Removed, and
written for players (content) and developers (technical) as appropriate.

## Compatibility

- Protocol changes are versioned; clients negotiate the protocol version on handshake.
- Save/schema changes ship with migrations and are validated before release.
