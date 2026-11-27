ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_plant_fkey;
ALTER TABLE projects ALTER COLUMN plant SET DEFAULT 'Cikarang';
ALTER TABLE projects ADD CONSTRAINT chk_projects_plant
    CHECK (plant IN ('Cikarang', 'Karawang'));
DROP INDEX IF EXISTS project_plants_deleted_at_idx;
DROP TABLE IF EXISTS project_plants;
