# Seed Data Documentation

## Overview

The `seed_data.sql` file contains initial/default data that should be loaded into your Supabase database. This data replaces the hardcoded values that were previously used in the services and ensures the database has the necessary reference data for the application to function properly.

## What Data Is Seeded?

### 1. System Units (`units` table)
**Purpose:** Global measurement units used across all companies

**Data includes:**
- **Weight units:** kg, g, lb, oz, mg
- **Volume units:** l, ml, cup, tbsp, tsp, gal, pt
- **Count units:** piece, dozen, pack, box, bottle, can
- **Specialty units:** clove, leaf, pinch, dash, bunch, sprig

**Total:** ~24 units with conversion factors

### 2. Calculator Settings (`calculator_settings` table)
**Purpose:** Default settings for pricing calculators (online, offline, catering)

**Categories:**
- **General:** profit margin, VAT rate, currency, rounding
- **Online:** app commission (30%), packaging cost, delivery fees
- **Offline:** overhead percentage, target food cost, labor multiplier
- **Catering:** transport cost, setup fees, minimum persons
- **Cost Analysis:** price alerts, seasonal tracking
- **Recipes:** serving sizes, waste tracking

**Total:** ~20 default settings

### 3. Categories (`categories` table)
**Purpose:** Organize ingredients and recipes

**Ingredient Categories (14):**
- Carne și Preparate din Carne (Meat) 🥩
- Legume (Vegetables) 🥕
- Lactate și Ouă (Dairy & Eggs) 🥛
- Uleiuri și Grăsimi (Oils & Fats) 🛢️
- Condimente și Ierburi (Spices & Herbs) 🌿
- Cereale și Făinoase (Grains) 🌾
- Pește și Fructe de Mare (Seafood) 🐟
- Fructe (Fruits) 🍎
- Băuturi (Beverages) 🥤
- Produse de Panificație (Bakery) 🥖
- Dulciuri și Deserturi (Sweets) 🍰
- Sosuri și Condimente (Sauces) 🍯
- Produse Congelate (Frozen) ❄️
- Altele (Other) 📦

**Recipe/Product Categories (10):**
- Ciorbe și Supe (Soups) 🍲
- Feluri Principale (Main Dishes) 🍽️
- Garnituri (Sides) 🥗
- Salate (Salads) 🥬
- Deserturi (Desserts) 🍰
- Băuturi (Beverages) ☕
- Aperitive (Appetizers) 🍤
- Mic Dejun (Breakfast) 🍳
- Sosuri (Sauces) 🥫
- Pâine și Patiserie (Bread & Pastry) 🥐

### 4. Sample Company (`companies` table)
**Purpose:** Demo company for testing

**Company Details:**
- Name: "Restaurant Demo"
- ID: `11111111-1111-1111-1111-111111111111`
- All default calculator settings copied to this company

### 5. Sample Ingredients (`ingredients` table)
**Purpose:** Demo ingredients for the sample company

**Includes 21 common Romanian ingredients:**
- Meats: Chicken breast, pork, beef
- Vegetables: Tomatoes, onions, potatoes, peppers, carrots, garlic
- Dairy: Milk, sour cream, cheese, eggs
- Oils: Sunflower oil, butter
- Grains: Rice, flour, pasta
- Spices: Salt, black pepper, paprika

### 6. Sample Suppliers (`suppliers` table)
**Purpose:** Demo suppliers for the sample company

**Includes 4 suppliers:**
- Metro Cash & Carry (General)
- Caroli Foods Group (Meat)
- Agricola Bacău (Vegetables)
- Lactate de Țară (Dairy)

### 7. Product Templates (`product_templates` table)
**Purpose:** Common Romanian dish templates

**Includes 8 popular dishes:**
- Ciorbă de Burtă (Tripe Soup)
- Ciorbă de Legume (Vegetable Soup)
- Sarmale cu Mămăligă (Cabbage Rolls with Polenta)
- Mici cu Muștar (Grilled Sausages with Mustard)
- Șnițel de Pui (Chicken Schnitzel)
- Salată de Boeuf (Beef Salad)
- Papanași cu Smântână (Fried Doughnuts with Sour Cream)
- Cartofi Prăjiți (French Fries)

## How to Use

### Running the Seed Data (CORRECT ORDER - IMPORTANT!)

You must run the SQL files in this specific order:

#### Step 1: Run the main schema setup
```bash
# In Supabase Dashboard SQL Editor:
# 1. Open supabase_setup.sql
# 2. Copy and paste the entire contents
# 3. Click "Run"
```

#### Step 2: Run the missing tables schema
```bash
# In Supabase Dashboard SQL Editor:
# 1. Open schema_update_missing_tables.sql
# 2. Copy and paste the entire contents
# 3. Click "Run"

# This creates:
# - units table
# - categories table
# - calculator_settings table
# - ingredient_price_history table
# - user_settings table
# - user_profiles table
```

#### Step 3: Run the seed data
```bash
# In Supabase Dashboard SQL Editor:
# 1. Open seed_data.sql
# 2. Copy and paste the entire contents
# 3. Click "Run"

# OR via Supabase CLI:
supabase db execute -f supabase_setup.sql
supabase db execute -f schema_update_missing_tables.sql
supabase db execute -f seed_data.sql
```

**Note:** If you get any errors about tables already existing, that's fine - the scripts use `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to prevent duplicates.

### For New Companies

When creating a new company, you should:

1. **Copy default calculator settings:**
   ```sql
   INSERT INTO calculator_settings (company_id, setting_key, setting_category, label, description, value_type, value_number, value_text, value_boolean, sort_order, is_active)
   SELECT
     'YOUR_COMPANY_ID_HERE'::uuid,
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
   WHERE company_id IS NULL;
   ```

2. **Categories and Units are global** (company_id = null), so they're automatically available to all companies.

3. **Ingredients and Suppliers** should be added by the company itself through the application.

## Service Integration

The seed data is designed to work with these services:

- **`unitsService.ts`** - Uses the `units` table
- **`categoriesService.ts`** - Uses the `categories` table
- **`companySettingsService.ts`** - Uses the `calculator_settings` table
- **`ingredientService.ts`** - Will query from `ingredients` table
- **`productService.ts`** - Will query from `products` table

All services now pull data from the database instead of using hardcoded values.

## Customization

You can customize the seed data by:

1. **Modifying default values** in `seed_data.sql` before running it
2. **Adding more categories** for your specific cuisine type
3. **Adding more units** if you need specialized measurements
4. **Adjusting calculator settings** to match your business model

## Verification

After running the seed data, you can verify it with these queries:

```sql
-- Check units
SELECT 'Units:', COUNT(*) FROM units;

-- Check calculator settings
SELECT 'Calculator Settings:', COUNT(*) FROM calculator_settings;

-- Check categories
SELECT 'Categories:', COUNT(*) FROM categories;

-- Check demo company data
SELECT 'Ingredients:', COUNT(*) FROM ingredients
WHERE company_id = '11111111-1111-1111-1111-111111111111';

SELECT 'Suppliers:', COUNT(*) FROM suppliers
WHERE company_id = '11111111-1111-1111-1111-111111111111';

-- Check product templates
SELECT 'Product Templates:', COUNT(*) FROM product_templates;
```

Expected results:
- Units: ~24
- Calculator Settings: ~20
- Categories: ~24
- Ingredients: 21
- Suppliers: 4
- Product Templates: 8

## Notes

- All seed data uses `ON CONFLICT DO NOTHING` to prevent duplicate entries if run multiple times
- The demo company ID is `11111111-1111-1111-1111-111111111111`
- System-wide data (units, categories, default settings) have `company_id = null`
- All prices are in RON (Romanian Lei)
- Data is in Romanian language for ingredient/category names to match the target market
