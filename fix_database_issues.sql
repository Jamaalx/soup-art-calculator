-- ============================================================================
-- MENU CALCULATOR PRO - DATABASE FIXES
-- Fix multi-tenant data isolation, RLS policies, and schema issues
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. FIX PRODUCTS TABLE - ADD MISSING RLS POLICIES
-- ============================================================================

-- Enable RLS on products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own company products" ON products;
DROP POLICY IF EXISTS "Users can insert own company products" ON products;
DROP POLICY IF EXISTS "Users can update own company products" ON products;
DROP POLICY IF EXISTS "Users can delete own company products" ON products;

-- CREATE PROPER RLS POLICIES FOR PRODUCTS
-- Users can only see products from their company
CREATE POLICY "Users can view own company products" ON products
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can insert products for their company
CREATE POLICY "Users can insert own company products" ON products
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their company's products
CREATE POLICY "Users can update own company products" ON products
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete their company's products
CREATE POLICY "Users can delete own company products" ON products
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 2. FIX CATEGORIES TABLE - ADD/UPDATE RLS POLICIES
-- ============================================================================

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own company categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own company categories" ON categories;
DROP POLICY IF EXISTS "Users can update own company categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own company categories" ON categories;

-- CREATE PROPER RLS POLICIES FOR CATEGORIES
CREATE POLICY "Users can view own company categories" ON categories
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company categories" ON categories
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company categories" ON categories
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company categories" ON categories
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 3. CREATE DELIVERY PLATFORMS TABLE (dynamic, per-company configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  platform_name VARCHAR(100) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL, -- e.g., 17.00 for 17%
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  platform_color VARCHAR(7), -- hex color code for UI
  platform_icon VARCHAR(50), -- icon name or emoji
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, platform_name)
);

-- Enable RLS
ALTER TABLE delivery_platforms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_platforms
CREATE POLICY "Users can view own company platforms" ON delivery_platforms
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company platforms" ON delivery_platforms
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company platforms" ON delivery_platforms
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company platforms" ON delivery_platforms
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_delivery_platforms_company_id ON delivery_platforms(company_id);

-- ============================================================================
-- 4. ADD ADMIN BYPASS POLICIES
-- ============================================================================

-- Admin users should be able to see all data for management purposes
-- These policies allow admins to bypass company_id restrictions

-- Products: Admin bypass
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Categories: Admin bypass
CREATE POLICY "Admins can view all categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Ingredients: Admin bypass
CREATE POLICY "Admins can view all ingredients" ON ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Recipes: Admin bypass
CREATE POLICY "Admins can view all recipes" ON recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Delivery Platforms: Admin bypass
CREATE POLICY "Admins can view all platforms" ON delivery_platforms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. FIX USER_ID REFERENCES (Remove user_id, use only company_id)
-- ============================================================================

-- Products should ONLY use company_id, not user_id
-- Update any products that have user_id but no company_id
UPDATE products
SET company_id = (
  SELECT company_id
  FROM profiles
  WHERE id = products.user_id
  LIMIT 1
)
WHERE user_id IS NOT NULL
  AND company_id IS NULL;

-- Same for categories
UPDATE categories
SET company_id = (
  SELECT company_id
  FROM profiles
  WHERE id = categories.user_id
  LIMIT 1
)
WHERE user_id IS NOT NULL
  AND company_id IS NULL;

-- ============================================================================
-- 6. CREATE DEFAULT DELIVERY PLATFORMS FOR EXISTING COMPANIES
-- ============================================================================

-- Insert default Romanian delivery platforms for each company
INSERT INTO delivery_platforms (company_id, platform_name, commission_rate, sort_order, platform_color, is_active)
SELECT
  c.id as company_id,
  platform.name,
  platform.rate,
  platform.sort_order,
  platform.color,
  true
FROM companies c
CROSS JOIN (
  VALUES
    ('Glovo', 17.00, 1, '#FFC244'),
    ('Bolt Food', 15.00, 2, '#34D186'),
    ('Wolt', 15.00, 3, '#00C2E8'),
    ('Tazz', 16.00, 4, '#FF6B35'),
    ('Uber Eats', 18.00, 5, '#06C167')
) AS platform(name, rate, sort_order, color)
WHERE NOT EXISTS (
  SELECT 1
  FROM delivery_platforms dp
  WHERE dp.company_id = c.id
  AND dp.platform_name = platform.name
);

-- ============================================================================
-- 7. ADD COMPANY_NAME COLUMN TO PROFILES (if missing)
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Update company_name from companies table
UPDATE profiles p
SET company_name = c.name
FROM companies c
WHERE p.company_id = c.id
  AND (p.company_name IS NULL OR p.company_name = '');

-- ============================================================================
-- 8. CREATE TRIGGER TO AUTO-UPDATE COMPANY_NAME ON PROFILES
-- ============================================================================

-- Function to update company_name when company_id changes
CREATE OR REPLACE FUNCTION update_profile_company_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NOT NULL THEN
    NEW.company_name := (
      SELECT name
      FROM companies
      WHERE id = NEW.company_id
      LIMIT 1
    );
  ELSE
    NEW.company_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS profile_company_name_trigger ON profiles;

-- Create trigger
CREATE TRIGGER profile_company_name_trigger
  BEFORE INSERT OR UPDATE OF company_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_company_name();

-- ============================================================================
-- 9. VERIFY DATA INTEGRITY
-- ============================================================================

-- Check for orphaned products (no company_id)
-- These should be visible to admins for assignment
SELECT COUNT(*) as orphaned_products_count
FROM products
WHERE company_id IS NULL;

-- Check for orphaned categories
SELECT COUNT(*) as orphaned_categories_count
FROM categories
WHERE company_id IS NULL;

-- Check users without company assignment
SELECT COUNT(*) as users_without_company_count
FROM profiles
WHERE company_id IS NULL
  AND role != 'admin';

-- ============================================================================
-- 10. GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Ensure authenticated users can access these tables
GRANT ALL ON products TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON delivery_platforms TO authenticated;
GRANT ALL ON ingredients TO authenticated;
GRANT ALL ON recipes TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after applying the fixes to verify everything works:

-- 1. Check RLS policies on products
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'products';

-- 2. Check RLS policies on categories
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'categories';

-- 3. Check RLS policies on delivery_platforms
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'delivery_platforms';

-- 4. Verify delivery platforms were created
SELECT
  c.name as company_name,
  COUNT(dp.id) as platforms_count,
  STRING_AGG(dp.platform_name || ' (' || dp.commission_rate || '%)', ', ') as platforms
FROM companies c
LEFT JOIN delivery_platforms dp ON c.id = dp.company_id
GROUP BY c.id, c.name;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Next steps after running this script:
-- 1. Test that users can see their products: /dashboard/pricing/offline
-- 2. Test that ingredients page loads: /dashboard/foodcost/ingredients
-- 3. Test that delivery platforms are now dynamic: /dashboard/pricing/delivery
-- 4. Verify admin panel shows all sections
-- 5. Check that products assigned to companies are visible to users

COMMENT ON TABLE delivery_platforms IS 'Company-specific delivery platform configurations with custom commission rates';
