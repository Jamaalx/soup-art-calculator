-- ============================================================================
-- SCHEMA UPDATE: Missing Tables for Seed Data
-- Run this BEFORE running seed_data.sql
-- This adds tables that were referenced but not created in supabase_setup.sql
-- ============================================================================

-- ============================================================================
-- 1. UNITS TABLE (for measurement units)
-- ============================================================================
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL, -- weight, volume, count, length, other
  base_unit VARCHAR(20), -- For conversion purposes
  conversion_factor DECIMAL(10,6), -- How many base units this represents
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES companies(id), -- null for system-wide units
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(abbreviation, company_id)
);

-- ============================================================================
-- 2. CATEGORIES TABLE (for ingredients and recipes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  icon VARCHAR(50),
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES companies(id), -- null for system-wide categories
  user_id UUID, -- references profiles(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. CALCULATOR_SETTINGS TABLE (for pricing settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS calculator_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id), -- null for default/template settings
  setting_key VARCHAR(100) NOT NULL,
  setting_category VARCHAR(100) NOT NULL, -- general, online, offline, catering, etc.
  label VARCHAR(255) NOT NULL,
  description TEXT,
  value_type VARCHAR(50) NOT NULL, -- number, text, boolean
  value_number DECIMAL(10,2),
  value_text TEXT,
  value_boolean BOOLEAN,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, setting_key)
);

-- ============================================================================
-- 4. INGREDIENT_PRICE_HISTORY TABLE (for price tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  price_change DECIMAL(10,2) NOT NULL,
  price_change_percent DECIMAL(10,2) NOT NULL,
  change_reason TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  purchase_location TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. USER_SETTINGS TABLE (for user preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'RON',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_zone VARCHAR(50) DEFAULT 'Europe/Bucharest',
  email_notifications BOOLEAN DEFAULT true,
  cost_alerts BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  order_reminders BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. USER_PROFILES TABLE (for user profile data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  restaurant_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_units_type ON units(type);
CREATE INDEX IF NOT EXISTS idx_units_company_id ON units(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_category_id ON categories(category_id);
CREATE INDEX IF NOT EXISTS idx_calculator_settings_company_id ON calculator_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_calculator_settings_category ON calculator_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_ingredient_price_history_ingredient ON ingredient_price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_price_history_recorded ON ingredient_price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Units: Users can view system units and their company's units
CREATE POLICY "Users can view available units" ON units
  FOR SELECT USING (
    company_id IS NULL OR
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Categories: Users can view system categories and their company's categories
CREATE POLICY "Users can view available categories" ON categories
  FOR SELECT USING (
    company_id IS NULL OR
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Calculator Settings: Users can view default settings and their company's settings
CREATE POLICY "Users can view calculator settings" ON calculator_settings
  FOR ALL USING (
    company_id IS NULL OR
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ingredient Price History: Users can only access their company's data
CREATE POLICY "Users can view own company price history" ON ingredient_price_history
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- User Settings: Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- 9. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp for units
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp for categories
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp for calculator_settings
CREATE TRIGGER update_calculator_settings_updated_at BEFORE UPDATE ON calculator_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp for user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp for user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. RPC FUNCTIONS FOR CALCULATOR SETTINGS
-- ============================================================================

-- Get all company settings (merges default + company-specific)
CREATE OR REPLACE FUNCTION get_all_company_settings()
RETURNS TABLE (
  setting_key VARCHAR,
  setting_category VARCHAR,
  label VARCHAR,
  description TEXT,
  value_type VARCHAR,
  value_number DECIMAL,
  value_text TEXT,
  value_boolean BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(cs.setting_key, ds.setting_key) as setting_key,
    COALESCE(cs.setting_category, ds.setting_category) as setting_category,
    COALESCE(cs.label, ds.label) as label,
    COALESCE(cs.description, ds.description) as description,
    COALESCE(cs.value_type, ds.value_type) as value_type,
    COALESCE(cs.value_number, ds.value_number) as value_number,
    COALESCE(cs.value_text, ds.value_text) as value_text,
    COALESCE(cs.value_boolean, ds.value_boolean) as value_boolean,
    COALESCE(cs.sort_order, ds.sort_order) as sort_order
  FROM calculator_settings ds
  LEFT JOIN calculator_settings cs ON ds.setting_key = cs.setting_key
    AND cs.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  WHERE ds.company_id IS NULL AND ds.is_active = true
  ORDER BY sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get specific company setting
CREATE OR REPLACE FUNCTION get_company_setting(p_setting_key VARCHAR, p_setting_category VARCHAR DEFAULT NULL)
RETURNS TABLE (
  setting_key VARCHAR,
  label VARCHAR,
  value_number DECIMAL,
  value_text TEXT,
  value_boolean BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(cs.setting_key, ds.setting_key) as setting_key,
    COALESCE(cs.label, ds.label) as label,
    COALESCE(cs.value_number, ds.value_number) as value_number,
    COALESCE(cs.value_text, ds.value_text) as value_text,
    COALESCE(cs.value_boolean, ds.value_boolean) as value_boolean
  FROM calculator_settings ds
  LEFT JOIN calculator_settings cs ON ds.setting_key = cs.setting_key
    AND cs.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  WHERE ds.company_id IS NULL
    AND ds.setting_key = p_setting_key
    AND (p_setting_category IS NULL OR ds.setting_category = p_setting_category)
    AND ds.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

COMMENT ON TABLE units IS 'Measurement units (system-wide and company-specific)';
COMMENT ON TABLE categories IS 'Categories for ingredients and recipes';
COMMENT ON TABLE calculator_settings IS 'Settings for pricing calculators';
COMMENT ON TABLE ingredient_price_history IS 'Historical price tracking for ingredients';
COMMENT ON TABLE user_settings IS 'User preferences and settings';
COMMENT ON TABLE user_profiles IS 'User profile information';
