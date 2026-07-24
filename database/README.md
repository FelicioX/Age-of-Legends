# Database

PostgreSQL schema, migrations and seeds for Age of Legends.

## Layout

| Path          | Purpose                                                           |
| ------------- | ----------------------------------------------------------------- |
| `schema/`     | Baseline schema applied on first container start                  |
| `migrations/` | Ordered, incremental schema changes                               |
| `seeds/`      | Development/content seed data                                     |
| `backups/`    | Local backup artifacts (git-ignored)                              |

## Local Development

`docker compose up -d` starts PostgreSQL and applies `schema/*.sql` on first run. See
[../docs/architecture/Database.md](../docs/architecture/Database.md) for the model and
[../docs/architecture/Persistence.md](../docs/architecture/Persistence.md) for the save strategy.

## Conventions

- `snake_case` names, surrogate identity keys, `created_at`/`updated_at` timestamps.
- Quantities stored as integers (smallest unit) to avoid floating-point error.
- Migrations are reviewed like code and reversible where feasible.
