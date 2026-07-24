-- Age of Legends — initial schema (Milestone 0 baseline).
-- Applied automatically by the PostgreSQL container on first start.
-- Subsequent changes are delivered as ordered migrations under database/migrations.

BEGIN;

CREATE TABLE IF NOT EXISTS accounts (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_id   UUID NOT NULL DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kingdoms (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    level       INT NOT NULL DEFAULT 1,
    shard_id    TEXT NOT NULL,
    pos_x       INT NOT NULL DEFAULT 0,
    pos_y       INT NOT NULL DEFAULT 0,
    wood        BIGINT NOT NULL DEFAULT 0,
    stone       BIGINT NOT NULL DEFAULT 0,
    iron        BIGINT NOT NULL DEFAULT 0,
    food        BIGINT NOT NULL DEFAULT 0,
    gold        BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (account_id)
);
CREATE INDEX IF NOT EXISTS idx_kingdoms_shard ON kingdoms (shard_id);

CREATE TABLE IF NOT EXISTS buildings (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kingdom_id   BIGINT NOT NULL REFERENCES kingdoms (id) ON DELETE CASCADE,
    type         TEXT NOT NULL,
    tier         INT NOT NULL DEFAULT 1,
    grid_col     INT NOT NULL,
    grid_row     INT NOT NULL,
    upgrading_until TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_buildings_kingdom ON buildings (kingdom_id);

CREATE TABLE IF NOT EXISTS heroes (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kingdom_id   BIGINT NOT NULL REFERENCES kingdoms (id) ON DELETE CASCADE,
    archetype    TEXT NOT NULL,
    name         TEXT NOT NULL,
    level        INT NOT NULL DEFAULT 1,
    star_rank    INT NOT NULL DEFAULT 1,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_heroes_kingdom ON heroes (kingdom_id);

CREATE TABLE IF NOT EXISTS guilds (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    level        INT NOT NULL DEFAULT 1,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guild_members (
    guild_id     BIGINT NOT NULL REFERENCES guilds (id) ON DELETE CASCADE,
    account_id   BIGINT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    role         TEXT NOT NULL DEFAULT 'member',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (guild_id, account_id)
);

COMMIT;
