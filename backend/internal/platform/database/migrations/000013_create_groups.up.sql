CREATE TABLE IF NOT EXISTS groups (
    id bigserial PRIMARY KEY,
    code varchar(16) NOT NULL UNIQUE,
    name varchar(255) NOT NULL DEFAULT '',
    created_at timestamptz,
    updated_at timestamptz,
    deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS groups_deleted_at_idx ON groups (deleted_at);
