-- HoReCa Finance Suite - Complete Database Setup
-- Run these commands in your Supabase SQL Editor

-- ============================================================================
-- 1. COMPANIES TABLE (Multi-tenant support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. UPDATE PROFILES TABLE
-- ============================================================================
-- Add company_id to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- 3. INGREDIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL, -- kg, g, l, ml, pieces, etc.
  cost_per_unit DECIMAL(10,2) NOT NULL,
  supplier_id UUID, -- Will reference suppliers table
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. RECIPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  serving_size INTEGER DEFAULT 1,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  instructions TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. RECIPE INGREDIENTS (Junction table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  cost DECIMAL(10,2), -- Calculated field
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. COMPETITORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  category VARCHAR(100), -- fast-food, fine-dining, casual, etc.
  price_range VARCHAR(20), -- budget, mid-range, premium
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 7. COMPETITOR PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitor_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  date_recorded DATE DEFAULT CURRENT_DATE,
  source VARCHAR(100), -- menu, website, visit, etc.
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 8. SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  category VARCHAR(100), -- produce, meat, dairy, dry-goods, etc.
  payment_terms VARCHAR(100),
  delivery_schedule VARCHAR(255),
  minimum_order DECIMAL(10,2),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 9. SUPPLIER ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) NOT NULL,
  order_number VARCHAR(100),
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 10. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES supplier_orders(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id),
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 11. BUDGETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(15,2) NOT NULL,
  food_cost_budget DECIMAL(15,2),
  labor_cost_budget DECIMAL(15,2),
  overhead_budget DECIMAL(15,2),
  marketing_budget DECIMAL(15,2),
  revenue_target DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 12. FINANCIAL SCENARIOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50) NOT NULL, -- best-case, worst-case, realistic
  revenue_projection DECIMAL(15,2),
  cost_projection DECIMAL(15,2),
  profit_projection DECIMAL(15,2),
  assumptions JSONB, -- Store scenario assumptions as JSON
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 13. MENU EXPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- foodpanda, glovo, uber-eats, restaurant
  export_type VARCHAR(50) NOT NULL, -- online, offline, catering
  template_data JSONB NOT NULL, -- Store template configuration
  product_data JSONB, -- Store exported products data
  file_url VARCHAR(500), -- URL to generated file
  status VARCHAR(20) DEFAULT 'draft', -- draft, generated, published
  generated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 14. BUSINESS REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- weekly, menu-performance, supplier-spending, profit-trends
  report_name VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_data JSONB NOT NULL, -- Store calculated report data
  status VARCHAR(20) DEFAULT 'generated', -- generated, archived
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 15. UPDATE EXISTING PRODUCTS TABLE
-- ============================================================================
-- Add company_id to existing products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES recipes(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS food_cost DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2);

-- ============================================================================
-- 16. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
-- Company-based indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_ingredients_company_id ON ingredients(company_id);
CREATE INDEX IF NOT EXISTS idx_recipes_company_id ON recipes(company_id);
CREATE INDEX IF NOT EXISTS idx_competitors_company_id ON competitors(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_company_id ON supplier_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_scenarios_company_id ON financial_scenarios(company_id);
CREATE INDEX IF NOT EXISTS idx_menu_exports_company_id ON menu_exports(company_id);
CREATE INDEX IF NOT EXISTS idx_business_reports_company_id ON business_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_competitor_products_competitor_id ON competitor_products(competitor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);

-- Date-based indexes for reporting
CREATE INDEX IF NOT EXISTS idx_competitor_products_date ON competitor_products(date_recorded);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_date ON supplier_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_business_reports_period ON business_reports(period_start, period_end);

-- ============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reports ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only see their own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ingredients: Users can only access their company's ingredients
CREATE POLICY "Users can view own company ingredients" ON ingredients
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recipes: Users can only access their company's recipes
CREATE POLICY "Users can view own company recipes" ON recipes
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recipe Ingredients: Access through recipe company association
CREATE POLICY "Users can view own company recipe ingredients" ON recipe_ingredients
  FOR ALL USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Competitors: Users can only access their company's competitor data
CREATE POLICY "Users can view own company competitors" ON competitors
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Competitor Products: Access through competitor company association
CREATE POLICY "Users can view own company competitor products" ON competitor_products
  FOR ALL USING (
    competitor_id IN (
      SELECT id FROM competitors WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Suppliers: Users can only access their company's suppliers
CREATE POLICY "Users can view own company suppliers" ON suppliers
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Supplier Orders: Users can only access their company's orders
CREATE POLICY "Users can view own company orders" ON supplier_orders
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Order Items: Access through order company association
CREATE POLICY "Users can view own company order items" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM supplier_orders WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Budgets: Users can only access their company's budgets
CREATE POLICY "Users can view own company budgets" ON budgets
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Financial Scenarios: Users can only access their company's scenarios
CREATE POLICY "Users can view own company scenarios" ON financial_scenarios
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Menu Exports: Users can only access their company's exports
CREATE POLICY "Users can view own company exports" ON menu_exports
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Business Reports: Users can only access their company's reports
CREATE POLICY "Users can view own company reports" ON business_reports
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 18. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_products_updated_at BEFORE UPDATE ON competitor_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_scenarios_updated_at BEFORE UPDATE ON financial_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_exports_updated_at BEFORE UPDATE ON menu_exports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_reports_updated_at BEFORE UPDATE ON business_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 19. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert a sample company
INSERT INTO companies (id, name, email, phone, address) VALUES 
('00000000-0000-0000-0000-000000000001', 'Sample Restaurant', 'admin@sample-restaurant.com', '+1234567890', '123 Main St, City, Country')
ON CONFLICT (id) DO NOTHING;

-- Insert sample ingredients
INSERT INTO ingredients (company_id, name, category, unit, cost_per_unit) VALUES 
('00000000-0000-0000-0000-000000000001', 'Chicken Breast', 'Meat', 'kg', 8.50),
('00000000-0000-0000-0000-000000000001', 'Tomatoes', 'Vegetables', 'kg', 3.20),
('00000000-0000-0000-0000-000000000001', 'Olive Oil', 'Oils', 'l', 12.00),
('00000000-0000-0000-0000-000000000001', 'Mozzarella', 'Dairy', 'kg', 15.50)
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (company_id, name, contact_person, email, phone, category) VALUES 
('00000000-0000-0000-0000-000000000001', 'Fresh Foods Ltd', 'John Smith', 'john@freshfoods.com', '+1234567891', 'produce'),
('00000000-0000-0000-0000-000000000001', 'Premium Meats Co', 'Sarah Johnson', 'sarah@premiummeats.com', '+1234567892', 'meat'),
('00000000-0000-0000-0000-000000000001', 'Dairy Farm Direct', 'Mike Wilson', 'mike@dairyfarm.com', '+1234567893', 'dairy')
ON CONFLICT DO NOTHING;

-- Insert sample competitors
INSERT INTO competitors (company_id, name, location, category, price_range) VALUES 
('00000000-0000-0000-0000-000000000001', 'Competitor Restaurant A', 'Downtown', 'casual', 'mid-range'),
('00000000-0000-0000-0000-000000000001', 'Fast Food Chain B', 'Mall', 'fast-food', 'budget'),
('00000000-0000-0000-0000-000000000001', 'Fine Dining C', 'Uptown', 'fine-dining', 'premium')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 20. ADMIN USER SETUP (Run after creating your first user)
-- ============================================================================

-- Update your profile to admin role (replace 'your-user-id' with actual UUID)
-- UPDATE profiles SET role = 'admin', company_id = '00000000-0000-0000-0000-000000000001' WHERE id = 'your-user-id';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- After running this script:
-- 1. Update your user profile with admin role and company_id
-- 2. The application will automatically create company associations for new users
-- 3. All data is properly isolated by company_id using RLS policies
-- 4. Admin users can access cross-company data through the admin panel

COMMENT ON SCHEMA public IS 'HoReCa Finance Suite - Complete database schema with multi-tenant support';