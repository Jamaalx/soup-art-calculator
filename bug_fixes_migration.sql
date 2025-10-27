-- ============================================================================
-- Bug Fixes Migration
-- This migration adds missing columns and tables needed for the bug fixes
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO RECIPES TABLE
-- ============================================================================
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS suggested_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platforms TEXT[],
ADD COLUMN IF NOT EXISTS platform_pricing JSONB,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS allergens TEXT[],
ADD COLUMN IF NOT EXISTS nutrition_info JSONB,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2) DEFAULT 0;

-- ============================================================================
-- 2. CREATE CALCULATOR_SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS calculator_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  setting_key VARCHAR(100) NOT NULL,
  setting_category VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  value_type VARCHAR(50) NOT NULL,
  value_number DECIMAL(10,2),
  value_text TEXT,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. CREATE CATEGORIES TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ingredient', 'recipe', 'competitor'
  icon VARCHAR(10),
  color VARCHAR(20),
  description TEXT,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. CREATE UNITS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'weight', 'volume', 'count'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. UPDATE MENU_EXPORTS TABLE
-- ============================================================================
-- Update menu_exports table to match new structure
ALTER TABLE menu_exports
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS export_type,
DROP COLUMN IF EXISTS template_data,
DROP COLUMN IF EXISTS product_data,
DROP COLUMN IF EXISTS file_url,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS generated_at,
DROP COLUMN IF EXISTS created_by;

ALTER TABLE menu_exports
ADD COLUMN IF NOT EXISTS format VARCHAR(20) NOT NULL DEFAULT 'csv',
ADD COLUMN IF NOT EXISTS product_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS filters JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS export_data JSONB,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 6. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_calculator_settings_company_id ON calculator_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_calculator_settings_category ON calculator_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_units_company_id ON units(company_id);

-- ============================================================================
-- 7. ENABLE RLS ON NEW TABLES
-- ============================================================================
ALTER TABLE calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- Calculator Settings
CREATE POLICY "Users can view own company calculator settings" ON calculator_settings
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Categories
CREATE POLICY "Users can view own company categories" ON categories
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Units
CREATE POLICY "Users can view own company units" ON units
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 9. INSERT DEFAULT PLATFORM SETTINGS FOR EXISTING COMPANIES
-- ============================================================================

-- Glovo Commission
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'glovo_commission',
  'online',
  'Glovo Commission',
  'Commission percentage for Glovo platform',
  'percentage',
  17.00,
  1,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Bolt Food Commission
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'bolt_commission',
  'online',
  'Bolt Food Commission',
  'Commission percentage for Bolt Food platform',
  'percentage',
  15.00,
  2,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Wolt Commission
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'wolt_commission',
  'online',
  'Wolt Commission',
  'Commission percentage for Wolt platform',
  'percentage',
  15.00,
  3,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Tazz Commission
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'tazz_commission',
  'online',
  'Tazz Commission',
  'Commission percentage for Tazz platform',
  'percentage',
  16.00,
  4,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Uber Eats Commission
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'uber_commission',
  'online',
  'Uber Eats Commission',
  'Commission percentage for Uber Eats platform',
  'percentage',
  18.00,
  5,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Packaging Cost
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'online_packaging_cost',
  'online',
  'Packaging Cost',
  'Default packaging cost for online orders',
  'fixed_amount',
  2.50,
  6,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- Processing Cost
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order, is_active)
SELECT
  id,
  'online_processing_cost',
  'online',
  'Processing Cost',
  'Default processing cost for online orders',
  'fixed_amount',
  1.00,
  7,
  true
FROM companies
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. INSERT DEFAULT CATEGORIES FOR EXISTING COMPANIES
-- ============================================================================

-- Default Recipe Categories
INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Soups',
  'recipe',
  '🍲',
  '#FFC857',
  1
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'recipe'
  AND categories.name = 'Soups'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Main Courses',
  'recipe',
  '🍖',
  '#BBDCFF',
  2
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'recipe'
  AND categories.name = 'Main Courses'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Sides',
  'recipe',
  '🥔',
  '#9eff55',
  3
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'recipe'
  AND categories.name = 'Sides'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Salads',
  'recipe',
  '🥗',
  '#90EE90',
  4
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'recipe'
  AND categories.name = 'Salads'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Desserts',
  'recipe',
  '🍰',
  '#FFB6C1',
  5
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'recipe'
  AND categories.name = 'Desserts'
);

-- Default Ingredient Categories
INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Vegetables',
  'ingredient',
  '🥕',
  '#90EE90',
  1
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'ingredient'
  AND categories.name = 'Vegetables'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Meat',
  'ingredient',
  '🥩',
  '#FF6B6B',
  2
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'ingredient'
  AND categories.name = 'Meat'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Dairy',
  'ingredient',
  '🥛',
  '#FFEAA7',
  3
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'ingredient'
  AND categories.name = 'Dairy'
);

INSERT INTO categories (company_id, name, type, icon, color, sort_order)
SELECT
  id,
  'Oils',
  'ingredient',
  '🫒',
  '#DFE6E9',
  4
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.company_id = companies.id
  AND categories.type = 'ingredient'
  AND categories.name = 'Oils'
);

-- ============================================================================
-- 11. INSERT DEFAULT UNITS FOR EXISTING COMPANIES
-- ============================================================================

-- Weight Units
INSERT INTO units (company_id, name, abbreviation, type)
SELECT
  id,
  'Kilogram',
  'kg',
  'weight'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM units
  WHERE units.company_id = companies.id
  AND units.abbreviation = 'kg'
);

INSERT INTO units (company_id, name, abbreviation, type)
SELECT
  id,
  'Gram',
  'g',
  'weight'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM units
  WHERE units.company_id = companies.id
  AND units.abbreviation = 'g'
);

-- Volume Units
INSERT INTO units (company_id, name, abbreviation, type)
SELECT
  id,
  'Liter',
  'l',
  'volume'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM units
  WHERE units.company_id = companies.id
  AND units.abbreviation = 'l'
);

INSERT INTO units (company_id, name, abbreviation, type)
SELECT
  id,
  'Milliliter',
  'ml',
  'volume'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM units
  WHERE units.company_id = companies.id
  AND units.abbreviation = 'ml'
);

-- Count Units
INSERT INTO units (company_id, name, abbreviation, type)
SELECT
  id,
  'Pieces',
  'pcs',
  'count'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM units
  WHERE units.company_id = companies.id
  AND units.abbreviation = 'pcs'
);

-- ============================================================================
-- 12. ADD TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_calculator_settings_updated_at BEFORE UPDATE ON calculator_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE calculator_settings IS 'Stores configurable calculator settings for platforms and pricing';
COMMENT ON TABLE categories IS 'Stores categories for ingredients, recipes, and competitors';
COMMENT ON TABLE units IS 'Stores measurement units for ingredients';
