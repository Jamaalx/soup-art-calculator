-- ============================================================================
-- Multi-Tenancy Refactoring Migration
-- This migration implements proper multi-company user support
-- Run this AFTER supabase_setup.sql and bug_fixes_migration.sql
-- ============================================================================

-- ============================================================================
-- 1. CREATE USER_COMPANIES JUNCTION TABLE (Many-to-Many)
-- ============================================================================
-- Allows users to belong to multiple companies (consultants, franchises, etc.)

CREATE TABLE IF NOT EXISTS user_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- Role within this specific company
  is_primary BOOLEAN DEFAULT false, -- Primary company for this user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, company_id) -- Prevent duplicate assignments
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- ============================================================================
-- 2. MIGRATE EXISTING COMPANY ASSIGNMENTS
-- ============================================================================
-- Move existing profiles.company_id to user_companies table

INSERT INTO user_companies (user_id, company_id, role, is_primary)
SELECT
  id as user_id,
  company_id,
  role,
  true as is_primary -- Existing company becomes primary
FROM profiles
WHERE company_id IS NOT NULL
ON CONFLICT (user_id, company_id) DO NOTHING;

-- ============================================================================
-- 3. CREATE INGREDIENT PRICE HISTORY TABLE
-- ============================================================================
-- Track price changes over time for cost analysis

CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  change_percentage DECIMAL(5,2), -- Calculated percentage change
  reason VARCHAR(255), -- Optional reason for price change
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingredient_price_history_ingredient_id ON ingredient_price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_price_history_date ON ingredient_price_history(changed_at);

-- ============================================================================
-- 4. CREATE SYSTEM_SETTINGS TABLE
-- ============================================================================
-- Global system settings (not company-specific)

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_category VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  value_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json'
  value_text TEXT,
  value_number DECIMAL(10,2),
  value_boolean BOOLEAN,
  value_json JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(setting_category);

-- ============================================================================
-- 5. INSERT DEFAULT SYSTEM SETTINGS (from hardcoded constants)
-- ============================================================================

-- Profit Thresholds
INSERT INTO system_settings (setting_key, setting_category, label, description, value_type, value_number)
VALUES
('profit_threshold_excellent', 'thresholds', 'Excellent Profit Margin', 'Profit margin considered excellent', 'number', 100.00),
('profit_threshold_good', 'thresholds', 'Good Profit Margin', 'Profit margin considered good', 'number', 80.00),
('profit_threshold_acceptable', 'thresholds', 'Acceptable Profit Margin', 'Profit margin considered acceptable', 'number', 50.00),
('profit_threshold_low', 'thresholds', 'Low Profit Margin', 'Profit margin considered low', 'number', 30.00)
ON CONFLICT (setting_key) DO NOTHING;

-- Pricing Strategies
INSERT INTO system_settings (setting_key, setting_category, label, description, value_type, value_number)
VALUES
('pricing_strategy_conservative', 'pricing', 'Conservative Pricing', 'Conservative pricing multiplier (120% margin)', 'number', 2.20),
('pricing_strategy_optimal', 'pricing', 'Optimal Pricing', 'Optimal pricing multiplier (100% margin)', 'number', 2.00),
('pricing_strategy_competitive', 'pricing', 'Competitive Pricing', 'Competitive pricing multiplier (80% margin)', 'number', 1.80)
ON CONFLICT (setting_key) DO NOTHING;

-- Cost Categories
INSERT INTO system_settings (setting_key, setting_category, label, description, value_type, value_json)
VALUES
('cost_categories', 'categories', 'Cost Categories', 'Menu cost categorization thresholds', 'json',
'{"economic": {"max": 15, "color": "green", "label": "Economic"}, "mediu": {"min": 15, "max": 20, "color": "yellow", "label": "Medium"}, "premium": {"min": 20, "color": "blue", "label": "Premium"}}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Brand Information
INSERT INTO system_settings (setting_key, setting_category, label, description, value_type, value_json)
VALUES
('brand_info', 'system', 'Brand Information', 'Application brand and contact information', 'json',
'{"name": "CLIENTII ZED-ZEN", "website": "https://soup-art-calculator.com", "email": "contact@zed-zen.com", "tagline": "Professional Food Cost Management"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 6. INSERT DEFAULT CALCULATOR SETTINGS FOR ALL COMPANIES
-- ============================================================================
-- Ensure all companies have complete calculator settings

DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN SELECT id FROM companies LOOP
    -- Offline Menu Settings
    INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order)
    VALUES
      (company_record.id, 'offline_packaging_cost', 'offline', 'Offline Packaging Cost', 'Packaging cost for offline orders', 'fixed_amount', 0.00, 1),
      (company_record.id, 'offline_commission', 'offline', 'Offline Commission', 'Commission for offline orders', 'percentage', 0.00, 2)
    ON CONFLICT DO NOTHING;

    -- Menu Limits
    INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, sort_order)
    VALUES
      (company_record.id, 'menu_min_items', 'limits', 'Minimum Menu Items', 'Minimum items per menu', 'number', 20, 10),
      (company_record.id, 'menu_max_items', 'limits', 'Maximum Menu Items', 'Maximum items per menu', 'number', 100, 11)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- 7. CREATE COMPANY_USERS VIEW (Helper for queries)
-- ============================================================================
-- Makes it easier to query user-company relationships

CREATE OR REPLACE VIEW company_users AS
SELECT
  uc.id,
  uc.user_id,
  uc.company_id,
  uc.role as company_role,
  uc.is_primary,
  p.email,
  p.role as global_role,
  p.is_active as user_active,
  c.name as company_name,
  c.is_active as company_active
FROM user_companies uc
JOIN profiles p ON uc.user_id = p.id
JOIN companies c ON uc.company_id = c.id;

-- ============================================================================
-- 8. UPDATE RLS POLICIES TO USE USER_COMPANIES
-- ============================================================================

-- Drop old company-based policies (we'll recreate with user_companies)
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can view own company ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can view own company recipes" ON recipes;
DROP POLICY IF EXISTS "Users can view own company recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Users can view own company competitors" ON competitors;
DROP POLICY IF EXISTS "Users can view own company competitor products" ON competitor_products;
DROP POLICY IF EXISTS "Users can view own company suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can view own company orders" ON supplier_orders;
DROP POLICY IF EXISTS "Users can view own company order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own company budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view own company scenarios" ON financial_scenarios;
DROP POLICY IF EXISTS "Users can view own company exports" ON menu_exports;
DROP POLICY IF EXISTS "Users can view own company reports" ON business_reports;
DROP POLICY IF EXISTS "Users can view own company calculator settings" ON calculator_settings;
DROP POLICY IF EXISTS "Users can view own company categories" ON categories;
DROP POLICY IF EXISTS "Users can view own company units" ON units;

-- Enable RLS on user_companies
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- User Companies: Users can see their own company assignments
CREATE POLICY "Users can view own company assignments" ON user_companies
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Companies: Users can see companies they're assigned to
CREATE POLICY "Users can view assigned companies" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Ingredients: Users can access assigned company ingredients
CREATE POLICY "Users can manage assigned company ingredients" ON ingredients
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Recipes: Users can access assigned company recipes
CREATE POLICY "Users can manage assigned company recipes" ON recipes
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Recipe Ingredients: Access through recipe company association
CREATE POLICY "Users can manage assigned company recipe ingredients" ON recipe_ingredients
  FOR ALL USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Competitors: Users can access assigned company competitor data
CREATE POLICY "Users can manage assigned company competitors" ON competitors
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Competitor Products: Access through competitor company association
CREATE POLICY "Users can manage assigned company competitor products" ON competitor_products
  FOR ALL USING (
    competitor_id IN (
      SELECT id FROM competitors WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Suppliers: Users can access assigned company suppliers
CREATE POLICY "Users can manage assigned company suppliers" ON suppliers
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Supplier Orders: Users can access assigned company orders
CREATE POLICY "Users can manage assigned company orders" ON supplier_orders
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Order Items: Access through order company association
CREATE POLICY "Users can manage assigned company order items" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM supplier_orders WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Budgets: Users can access assigned company budgets
CREATE POLICY "Users can manage assigned company budgets" ON budgets
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Financial Scenarios: Users can access assigned company scenarios
CREATE POLICY "Users can manage assigned company scenarios" ON financial_scenarios
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Menu Exports: Users can access assigned company exports
CREATE POLICY "Users can manage assigned company exports" ON menu_exports
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Business Reports: Users can access assigned company reports
CREATE POLICY "Users can manage assigned company reports" ON business_reports
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Calculator Settings: Users can access assigned company settings
CREATE POLICY "Users can manage assigned company calculator settings" ON calculator_settings
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    company_id IS NULL OR -- System-wide settings
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Categories: Users can access assigned company categories
CREATE POLICY "Users can manage assigned company categories" ON categories
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Units: Users can access assigned company units
CREATE POLICY "Users can manage assigned company units" ON units
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- System Settings: Only admins can access
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Ingredient Price History: Users can access assigned company history
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned company price history" ON ingredient_price_history
  FOR ALL USING (
    ingredient_id IN (
      SELECT id FROM ingredients WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 9. ADD TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_user_companies_updated_at BEFORE UPDATE ON user_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's primary company
CREATE OR REPLACE FUNCTION get_user_primary_company(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id
    FROM user_companies
    WHERE user_id = p_user_id AND is_primary = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has access to company
CREATE OR REPLACE FUNCTION user_has_company_access(p_user_id UUID, p_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_companies
    WHERE user_id = p_user_id AND company_id = p_company_id
  ) OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql;

-- Function to assign user to company
CREATE OR REPLACE FUNCTION assign_user_to_company(
  p_user_id UUID,
  p_company_id UUID,
  p_role VARCHAR DEFAULT 'user',
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- If setting as primary, unset other primary assignments
  IF p_is_primary THEN
    UPDATE user_companies
    SET is_primary = false
    WHERE user_id = p_user_id;
  END IF;

  -- Insert or update assignment
  INSERT INTO user_companies (user_id, company_id, role, is_primary)
  VALUES (p_user_id, p_company_id, p_role, p_is_primary)
  ON CONFLICT (user_id, company_id)
  DO UPDATE SET
    role = p_role,
    is_primary = p_is_primary,
    updated_at = NOW()
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. ADD PRODUCTS TABLE UPDATES (if not already done)
-- ============================================================================

-- Ensure products table has all necessary columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add products RLS policy
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage assigned company products" ON products;

CREATE POLICY "Users can manage assigned company products" ON products
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Add products trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE user_companies IS 'Junction table for many-to-many user-company relationships';
COMMENT ON TABLE ingredient_price_history IS 'Tracks ingredient price changes over time';
COMMENT ON TABLE system_settings IS 'Global system settings (not company-specific)';
COMMENT ON VIEW company_users IS 'Helper view for user-company relationships';

-- Migration summary
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Multi-Tenancy Refactoring Migration Completed Successfully';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - user_companies table (many-to-many)';
  RAISE NOTICE '  - ingredient_price_history table';
  RAISE NOTICE '  - system_settings table';
  RAISE NOTICE '  - company_users view';
  RAISE NOTICE '  - Helper functions for user-company access';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated:';
  RAISE NOTICE '  - All RLS policies to use user_companies';
  RAISE NOTICE '  - Calculator settings with defaults';
  RAISE NOTICE '  - Products table with necessary columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update application services to use new schema';
  RAISE NOTICE '  2. Test multi-company access';
  RAISE NOTICE '  3. Update UI to show company selection';
  RAISE NOTICE '============================================================================';
END $$;
