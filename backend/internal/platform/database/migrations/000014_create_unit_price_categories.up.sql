CREATE TABLE IF NOT EXISTS unit_price_categories (
    id          bigserial PRIMARY KEY,
    code        varchar(32) NOT NULL UNIQUE,
    name        varchar(255) NOT NULL DEFAULT '',
    code_prefix varchar(8) NOT NULL DEFAULT 'UP',
    sort_order  int NOT NULL DEFAULT 0,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);

INSERT INTO unit_price_categories (code, name, code_prefix, sort_order) VALUES
    ('LABOR',     'Labor',     'LBR', 1),
    ('MATERIALS', 'Materials', 'MTR', 2),
    ('EQUIPMENT', 'Equipment', 'EQP', 3),
    ('OTHER',     'Other',     'OTH', 4)
ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
    check_name text;
BEGIN
    SELECT conname INTO check_name
    FROM pg_constraint
    WHERE conrelid = 'unit_prices'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%category%';

    IF check_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE unit_prices DROP CONSTRAINT %I', check_name);
    END IF;
END $$;

ALTER TABLE unit_prices ADD CONSTRAINT unit_prices_category_fkey
    FOREIGN KEY (category) REFERENCES unit_price_categories(code)
    ON UPDATE CASCADE ON DELETE RESTRICT;
