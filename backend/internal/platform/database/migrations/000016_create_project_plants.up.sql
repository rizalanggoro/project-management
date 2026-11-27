CREATE TABLE IF NOT EXISTS project_plants (
    id          bigserial PRIMARY KEY,
    code        varchar(64) NOT NULL UNIQUE,
    name        varchar(255) NOT NULL DEFAULT '',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS project_plants_deleted_at_idx ON project_plants (deleted_at);

INSERT INTO project_plants (code, name) VALUES
    ('Cikarang', 'Cikarang'),
    ('Karawang', 'Karawang')
ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE check_name text;
BEGIN
    SELECT conname INTO check_name
    FROM pg_constraint
    WHERE conrelid = 'projects'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%plant%';

    IF check_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE projects DROP CONSTRAINT %I', check_name);
    END IF;
END $$;

ALTER TABLE projects ALTER COLUMN plant DROP DEFAULT;
ALTER TABLE projects ADD CONSTRAINT projects_plant_fkey
    FOREIGN KEY (plant) REFERENCES project_plants(code)
    ON UPDATE CASCADE ON DELETE RESTRICT;
