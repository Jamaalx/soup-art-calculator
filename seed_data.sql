-- ============================================================================
-- SEED DATA FOR SOUP ART CALCULATOR
-- This file contains initial/default data that should be loaded into the database
-- Run this AFTER running supabase_setup.sql or ensuring all tables exist
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM UNITS (Used globally across all companies)
-- ============================================================================
INSERT INTO units (name, abbreviation, type, base_unit, conversion_factor, is_active, company_id) VALUES
  -- Weight units
  ('Kilograms', 'kg', 'weight', 'g', 1000, true, null),
  ('Grams', 'g', 'weight', 'g', 1, true, null),
  ('Pounds', 'lb', 'weight', 'g', 453.592, true, null),
  ('Ounces', 'oz', 'weight', 'g', 28.3495, true, null),
  ('Milligrams', 'mg', 'weight', 'g', 0.001, true, null),

  -- Volume units
  ('Liters', 'l', 'volume', 'ml', 1000, true, null),
  ('Milliliters', 'ml', 'volume', 'ml', 1, true, null),
  ('Cups', 'cup', 'volume', 'ml', 240, true, null),
  ('Tablespoons', 'tbsp', 'volume', 'ml', 15, true, null),
  ('Teaspoons', 'tsp', 'volume', 'ml', 5, true, null),
  ('Gallons', 'gal', 'volume', 'ml', 3785.41, true, null),
  ('Pints', 'pt', 'volume', 'ml', 473.176, true, null),

  -- Count units
  ('Pieces', 'piece', 'count', 'piece', 1, true, null),
  ('Dozen', 'dz', 'count', 'piece', 12, true, null),
  ('Pack', 'pack', 'count', 'piece', 1, true, null),
  ('Box', 'box', 'count', 'piece', 1, true, null),
  ('Bottle', 'bottle', 'count', 'piece', 1, true, null),
  ('Can', 'can', 'count', 'piece', 1, true, null),

  -- Other common units
  ('Cloves (garlic)', 'clove', 'count', 'piece', 1, true, null),
  ('Leaves', 'leaf', 'count', 'piece', 1, true, null),
  ('Pinch', 'pinch', 'volume', 'ml', 0.3, true, null),
  ('Dash', 'dash', 'volume', 'ml', 0.6, true, null),
  ('Bunch', 'bunch', 'count', 'piece', 1, true, null),
  ('Sprig', 'sprig', 'count', 'piece', 1, true, null)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. DEFAULT CALCULATOR SETTINGS
-- These are company-specific settings with default values
-- Will be copied for each new company
-- ============================================================================

-- First, insert a demo/template company (can be used as template for new companies)
INSERT INTO companies (id, company_name, slug, is_active, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Default Template', 'default-template', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- General Calculator Settings
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, value_text, value_boolean, sort_order, is_active) VALUES
  -- General Settings
  (null, 'default_profit_margin', 'general', 'Default Profit Margin (%)', 'Default profit margin percentage for pricing calculations', 'number', 25, null, null, 1, true),
  (null, 'vat_rate', 'general', 'VAT Rate (%)', 'Value Added Tax rate percentage', 'number', 19, null, null, 2, true),
  (null, 'currency', 'general', 'Currency', 'Default currency code', 'text', null, 'RON', null, 3, true),
  (null, 'rounding_precision', 'general', 'Rounding Precision', 'Number of decimal places for prices', 'number', 2, null, null, 4, true),

  -- Online Calculator Settings (Food Delivery Platforms)
  (null, 'online_app_commission', 'online', 'App Commission (%)', 'Commission percentage charged by delivery platforms (Glovo, FoodPanda, UberEats)', 'number', 30, null, null, 10, true),
  (null, 'online_packaging_cost', 'online', 'Packaging Cost per Order', 'Average packaging cost per online order', 'number', 5, null, null, 11, true),
  (null, 'online_min_profit_margin', 'online', 'Minimum Profit Margin (%)', 'Minimum acceptable profit margin for online orders', 'number', 15, null, null, 12, true),
  (null, 'online_delivery_fee', 'online', 'Delivery Fee', 'Standard delivery fee (if applicable)', 'number', 0, null, null, 13, true),

  -- Offline Calculator Settings (Restaurant/Dine-in)
  (null, 'offline_overhead_percentage', 'offline', 'Overhead Percentage (%)', 'Percentage to account for rent, utilities, staff costs', 'number', 35, null, null, 20, true),
  (null, 'offline_target_food_cost', 'offline', 'Target Food Cost (%)', 'Target food cost percentage for offline menu items', 'number', 30, null, null, 21, true),
  (null, 'offline_labor_cost_multiplier', 'offline', 'Labor Cost Multiplier', 'Multiplier for labor costs in pricing', 'number', 1.5, null, null, 22, true),

  -- Catering Calculator Settings
  (null, 'catering_transport_cost', 'catering', 'Transport Cost per Event', 'Average transportation cost per catering event', 'number', 50, null, null, 30, true),
  (null, 'catering_packaging_cost', 'catering', 'Packaging Cost per Person', 'Packaging/disposables cost per person for catering', 'number', 3, null, null, 31, true),
  (null, 'catering_setup_fee', 'catering', 'Setup Fee', 'Fixed setup and cleanup fee for catering events', 'number', 100, null, null, 32, true),
  (null, 'catering_min_persons', 'catering', 'Minimum Persons', 'Minimum number of persons for catering orders', 'number', 10, null, null, 33, true),
  (null, 'catering_profit_margin', 'catering', 'Catering Profit Margin (%)', 'Target profit margin for catering events', 'number', 40, null, null, 34, true),

  -- Cost Analysis Settings
  (null, 'enable_price_alerts', 'cost_analysis', 'Enable Price Alerts', 'Send alerts when ingredient prices change significantly', 'boolean', null, null, true, 40, true),
  (null, 'price_change_threshold', 'cost_analysis', 'Price Change Alert Threshold (%)', 'Alert when ingredient price changes by this percentage', 'number', 10, null, null, 41, true),
  (null, 'track_seasonal_pricing', 'cost_analysis', 'Track Seasonal Pricing', 'Enable seasonal price tracking and predictions', 'boolean', null, null, true, 42, true),

  -- Recipe Management Settings
  (null, 'default_serving_size', 'recipes', 'Default Serving Size', 'Default number of servings for new recipes', 'number', 4, null, null, 50, true),
  (null, 'allow_recipe_scaling', 'recipes', 'Allow Recipe Scaling', 'Enable automatic scaling of recipe quantities', 'boolean', null, null, true, 51, true),
  (null, 'track_waste_percentage', 'recipes', 'Track Waste Percentage', 'Enable waste tracking in recipe calculations', 'boolean', null, null, true, 52, true),
  (null, 'default_waste_percentage', 'recipes', 'Default Waste Percentage (%)', 'Default waste percentage for ingredients', 'number', 5, null, null, 53, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SAMPLE COMPANY (for testing/demo purposes)
-- ============================================================================
INSERT INTO companies (id, company_name, slug, cui, address, phone, email, is_active, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Restaurant Demo', 'restaurant-demo', 'RO12345678', 'Str. Exemplu Nr. 1, București', '+40 123 456 789', 'demo@restaurant.ro', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Copy default settings for demo company
INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, value_text, value_boolean, sort_order, is_active)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  setting_key,
  setting_category,
  label,
  description,
  value_type,
  value_number,
  value_text,
  value_boolean,
  sort_order,
  is_active
FROM calculator_settings
WHERE company_id IS NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. DEFAULT INGREDIENT CATEGORIES (Global/Template)
-- ============================================================================
INSERT INTO categories (category_id, name, color, icon, sort_order, is_active, company_id, user_id) VALUES
  -- Ingredient Categories
  ('cat-meat', 'Carne și Preparate din Carne', '#DC2626', '🥩', 1, true, null, null),
  ('cat-vegetables', 'Legume', '#16A34A', '🥕', 2, true, null, null),
  ('cat-dairy', 'Lactate și Ouă', '#3B82F6', '🥛', 3, true, null, null),
  ('cat-oils', 'Uleiuri și Grăsimi', '#F59E0B', '🛢️', 4, true, null, null),
  ('cat-spices', 'Condimente și Ierburi', '#10B981', '🌿', 5, true, null, null),
  ('cat-grains', 'Cereale și Făinoase', '#8B5CF6', '🌾', 6, true, null, null),
  ('cat-seafood', 'Pește și Fructe de Mare', '#0EA5E9', '🐟', 7, true, null, null),
  ('cat-fruits', 'Fructe', '#EF4444', '🍎', 8, true, null, null),
  ('cat-beverages', 'Băuturi', '#6366F1', '🥤', 9, true, null, null),
  ('cat-bakery', 'Produse de Panificație', '#F97316', '🥖', 10, true, null, null),
  ('cat-sweets', 'Dulciuri și Deserturi', '#EC4899', '🍰', 11, true, null, null),
  ('cat-sauces', 'Sosuri și Condimente', '#D946EF', '🍯', 12, true, null, null),
  ('cat-frozen', 'Produse Congelate', '#06B6D4', '❄️', 13, true, null, null),
  ('cat-other', 'Altele', '#6B7280', '📦', 99, true, null, null)
ON CONFLICT (category_id) DO NOTHING;

-- ============================================================================
-- 5. DEFAULT RECIPE/PRODUCT CATEGORIES
-- ============================================================================
INSERT INTO categories (category_id, name, color, icon, sort_order, is_active, company_id, user_id) VALUES
  -- Recipe/Product Categories (Romanian cuisine style)
  ('recipe-soups', 'Ciorbe și Supe', '#DC2626', '🍲', 101, true, null, null),
  ('recipe-main', 'Feluri Principale', '#16A34A', '🍽️', 102, true, null, null),
  ('recipe-sides', 'Garnituri', '#F59E0B', '🥗', 103, true, null, null),
  ('recipe-salads', 'Salate', '#10B981', '🥬', 104, true, null, null),
  ('recipe-desserts', 'Deserturi', '#8B5CF6', '🍰', 105, true, null, null),
  ('recipe-beverages', 'Băuturi', '#6366F1', '☕', 106, true, null, null),
  ('recipe-appetizers', 'Aperitive', '#EC4899', '🍤', 107, true, null, null),
  ('recipe-breakfast', 'Mic Dejun', '#F97316', '🍳', 108, true, null, null),
  ('recipe-sauces', 'Sosuri', '#D946EF', '🥫', 109, true, null, null),
  ('recipe-bread', 'Pâine și Patiserie', '#92400E', '🥐', 110, true, null, null)
ON CONFLICT (category_id) DO NOTHING;

-- ============================================================================
-- 6. SAMPLE INGREDIENTS FOR DEMO COMPANY
-- ============================================================================
INSERT INTO ingredients (company_id, name, category, unit, cost_per_unit, is_active) VALUES
  -- Meat
  ('11111111-1111-1111-1111-111111111111', 'Piept de Pui', 'cat-meat', 'kg', 18.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Carne de Porc', 'cat-meat', 'kg', 22.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Carne de Vită', 'cat-meat', 'kg', 35.00, true),

  -- Vegetables
  ('11111111-1111-1111-1111-111111111111', 'Roșii', 'cat-vegetables', 'kg', 8.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Ceapă', 'cat-vegetables', 'kg', 3.20, true),
  ('11111111-1111-1111-1111-111111111111', 'Cartofi', 'cat-vegetables', 'kg', 4.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Ardei Gras', 'cat-vegetables', 'kg', 9.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Morcovi', 'cat-vegetables', 'kg', 4.50, true),

  -- Dairy
  ('11111111-1111-1111-1111-111111111111', 'Lapte', 'cat-dairy', 'l', 6.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Smântână', 'cat-dairy', 'kg', 18.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Brânză Telemea', 'cat-dairy', 'kg', 28.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Ouă', 'cat-dairy', 'piece', 0.80, true),

  -- Oils and Fats
  ('11111111-1111-1111-1111-111111111111', 'Ulei de Floarea Soarelui', 'cat-oils', 'l', 12.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Unt', 'cat-oils', 'kg', 35.00, true),

  -- Grains
  ('11111111-1111-1111-1111-111111111111', 'Orez', 'cat-grains', 'kg', 8.00, true),
  ('11111111-1111-1111-1111-111111111111', 'Făină', 'cat-grains', 'kg', 4.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Paste', 'cat-grains', 'kg', 7.50, true),

  -- Spices
  ('11111111-1111-1111-1111-111111111111', 'Sare', 'cat-spices', 'kg', 2.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Piper Negru', 'cat-spices', 'g', 0.08, true),
  ('11111111-1111-1111-1111-111111111111', 'Boia de Ardei', 'cat-spices', 'g', 0.10, true),
  ('11111111-1111-1111-1111-111111111111', 'Usturoi', 'cat-vegetables', 'kg', 12.00, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. SAMPLE SUPPLIERS FOR DEMO COMPANY
-- ============================================================================
INSERT INTO suppliers (company_id, name, contact_person, email, phone, category, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Metro Cash & Carry', 'Ion Popescu', 'contact@metro.ro', '+40 21 123 4567', 'General', true),
  ('11111111-1111-1111-1111-111111111111', 'Caroli Foods Group', 'Maria Ionescu', 'comenzi@caroli.ro', '+40 21 234 5678', 'Meat', true),
  ('11111111-1111-1111-1111-111111111111', 'Agricola Bacău', 'George Vasilescu', 'sales@agricola.ro', '+40 234 567 890', 'Vegetables', true),
  ('11111111-1111-1111-1111-111111111111', 'Lactate de Țară', 'Elena Georgescu', 'info@lactate.ro', '+40 21 345 6789', 'Dairy', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. PRODUCT TEMPLATES (Common Romanian dishes as templates)
-- ============================================================================
INSERT INTO product_templates (product_id, nume, category, cantitate, pret_cost, pret_offline, pret_online, is_active) VALUES
  ('TPL-CIORBA-BURTA', 'Ciorbă de Burtă', 'recipe-soups', '400ml', 12.00, 25.00, 32.00, true),
  ('TPL-CIORBA-LEGUME', 'Ciorbă de Legume', 'recipe-soups', '400ml', 8.00, 18.00, 23.00, true),
  ('TPL-SARMALE', 'Sarmale cu Mămăligă', 'recipe-main', '3 buc', 15.00, 32.00, 42.00, true),
  ('TPL-MICI', 'Mici cu Muștar', 'recipe-main', '5 buc', 10.00, 22.00, 28.00, true),
  ('TPL-SCHNITZEL', 'Șnițel de Pui', 'recipe-main', '200g', 12.00, 28.00, 36.00, true),
  ('TPL-SALATA-BOEUF', 'Salată de Boeuf', 'recipe-salads', '250g', 8.00, 18.00, 23.00, true),
  ('TPL-PAPANASI', 'Papanași cu Smântână', 'recipe-desserts', '2 buc', 6.00, 18.00, 23.00, true),
  ('TPL-CARTOFI-PRAJITI', 'Cartofi Prăjiți', 'recipe-sides', '200g', 3.00, 10.00, 13.00, true)
ON CONFLICT (product_id) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verification queries (comment out in production)
-- SELECT 'Units:', COUNT(*) FROM units;
-- SELECT 'Calculator Settings:', COUNT(*) FROM calculator_settings;
-- SELECT 'Categories:', COUNT(*) FROM categories;
-- SELECT 'Ingredients:', COUNT(*) FROM ingredients WHERE company_id = '11111111-1111-1111-1111-111111111111';
-- SELECT 'Suppliers:', COUNT(*) FROM suppliers WHERE company_id = '11111111-1111-1111-1111-111111111111';
-- SELECT 'Product Templates:', COUNT(*) FROM product_templates;

COMMENT ON TABLE units IS 'Seeded with default measurement units for weight, volume, and count';
COMMENT ON TABLE calculator_settings IS 'Seeded with default calculator settings for online, offline, and catering pricing';
COMMENT ON TABLE categories IS 'Seeded with default ingredient and recipe categories';
COMMENT ON TABLE ingredients IS 'Seeded with sample ingredients for demo company';
COMMENT ON TABLE suppliers IS 'Seeded with sample suppliers for demo company';
COMMENT ON TABLE product_templates IS 'Seeded with common Romanian dish templates';
