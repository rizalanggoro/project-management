ALTER TABLE unit_prices DROP CONSTRAINT IF EXISTS unit_prices_category_fkey;

ALTER TABLE unit_prices ADD CONSTRAINT unit_prices_category_check
    CHECK (category IN ('LABOR', 'MATERIALS', 'EQUIPMENT', 'OTHER'));

DROP TABLE IF EXISTS unit_price_categories;
