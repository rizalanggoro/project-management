ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_section_fkey;
ALTER TABLE projects ALTER COLUMN section SET DEFAULT 'GA Building';
ALTER TABLE projects ADD CONSTRAINT chk_projects_section
    CHECK (section IN ('GA Building', 'EHS', 'Wellfare'));
DROP INDEX IF EXISTS project_sections_deleted_at_idx;
DROP TABLE IF EXISTS project_sections;
