CREATE TABLE IF NOT EXISTS project_sections (
    id          bigserial PRIMARY KEY,
    code        varchar(64) NOT NULL UNIQUE,
    name        varchar(255) NOT NULL DEFAULT '',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS project_sections_deleted_at_idx ON project_sections (deleted_at);

INSERT INTO project_sections (code, name) VALUES
    ('GA Building', 'GA Building'),
    ('EHS', 'EHS'),
    ('Wellfare', 'Wellfare')
ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE check_name text;
BEGIN
    SELECT conname INTO check_name
    FROM pg_constraint
    WHERE conrelid = 'projects'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%section%';

    IF check_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE projects DROP CONSTRAINT %I', check_name);
    END IF;
END $$;

ALTER TABLE projects ALTER COLUMN section DROP DEFAULT;
ALTER TABLE projects ADD CONSTRAINT projects_section_fkey
    FOREIGN KEY (section) REFERENCES project_sections(code)
    ON UPDATE CASCADE ON DELETE RESTRICT;
