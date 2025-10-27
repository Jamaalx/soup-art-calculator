# Soup Art Calculator - Multi-Tenancy Refactoring Plan

## Executive Summary
This document outlines the comprehensive refactoring plan to fix multi-tenancy issues, improve database integration, and add a professional landing page to the food cost calculator application.

## Current State Analysis

### Database Technology
- **Platform**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS) policies
- **ORM**: Direct Supabase client queries

### Tables Structure
```
companies (multi-tenant foundation)
profiles (Supabase Auth users with company_id, role)
ingredients, recipes, products (with company_id FK)
competitors, suppliers, budgets (with company_id FK)
calculator_settings (platform commissions)
categories (ingredient/recipe/product types)
units (measurement units)
menu_exports, business_reports (reporting)
```

### Multi-Tenancy Status
✅ **Implemented**:
- Company table with foreign keys
- RLS policies on all tables
- Role-based filtering (admin, user)
- Service layer filtering

⚠️ **Issues Found**:
1. Services use inconsistent table names (`profiles` vs `user_profiles`)
2. Hardcoded business rules in `/src/lib/data/constants.ts`
3. Hardcoded category metadata in `/src/lib/data/categories.ts`
4. Users can only belong to ONE company (need many-to-many)
5. Admin dashboard has placeholder stats
6. Missing admin CRUD pages for ingredients/products
7. Settings page doesn't show multi-company info

## Critical Issues to Fix

### 1. Database Schema Inconsistencies

**Problem**: Services reference `user_profiles` table, but schema uses `profiles`

**Affected Files**:
- `/src/lib/services/ingredientService.ts:17` - queries `user_profiles`
- `/src/hooks/useProducts.ts` - likely queries `user_profiles`

**Solution**:
- Update all service files to use `profiles` table consistently
- Verify all RLS policies reference `profiles` table

### 2. Multi-Company User Assignment

**Current**: Users have single `company_id` in profiles table
**Required**: Users can belong to multiple companies (consultants, franchises)

**Solution**: Create junction table
```sql
CREATE TABLE user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user', -- role within this company
  is_primary BOOLEAN DEFAULT false, -- primary company selection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);
```

### 3. Hardcoded Business Rules

**Problem**: Business constants hardcoded in `/src/lib/data/constants.ts`

**Hardcoded Values**:
- Platform commissions (Glovo 17%, Bolt 15%, Wolt 15%, etc.)
- Packaging costs (3.00 LEI online, 0 offline)
- Profit thresholds (100% excellent, 80% good, etc.)
- Pricing strategies (2.2x conservative, 2.0x optimal, etc.)

**Solution**: Already have `calculator_settings` table
- Migrate constants to database
- Create service to fetch settings
- Update components to use database settings

### 4. Hardcoded Category Metadata

**Problem**: Category icons/colors in `/src/lib/data/categories.ts`

**Solution**: Already fixed in `bug_fixes_migration.sql`
- Categories table exists with icon, color fields
- Default categories inserted for each company
- Need to update services to fetch from database instead of hardcoded file

### 5. Incomplete Admin Dashboard

**Missing Features**:
- Dynamic stats (currently showing 0 values)
- Ingredients CRUD page (missing)
- Products CRUD page (missing)
- Recipes CRUD page (incomplete)
- System-wide data management

**Solution**:
- Create `/src/app/dashboard/admin/ingredients/page.tsx`
- Create `/src/app/dashboard/admin/products/page.tsx`
- Update admin dashboard to show real stats from database

### 6. Settings Page - Multi-Company Support

**Current**: Shows single company settings
**Required**:
- List all companies user belongs to
- Allow switching between company contexts
- Show company-specific settings per company

### 7. No Landing Page

**Current**: App starts at `/dashboard`
**Required**: Professional landing page at `/` with:
- Bilingual (Romanian + English)
- Educational content for restaurant owners
- ROI calculator widget
- CTA for signup/demo

## Refactoring Phases

### Phase 1: Database Schema Fixes (High Priority)
**Duration**: 30 minutes

1. Create multi-company user assignment migration
   ```sql
   -- Create user_companies junction table
   -- Migrate existing profiles.company_id to user_companies
   -- Update RLS policies to use user_companies
   ```

2. Add ingredient_price_history table (if missing)
   ```sql
   CREATE TABLE ingredient_price_history (
     id UUID PRIMARY KEY,
     ingredient_id UUID REFERENCES ingredients(id),
     old_price DECIMAL(10,2),
     new_price DECIMAL(10,2),
     changed_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. Add missing indexes and policies

**Files to Create**:
- `multi_tenancy_refactor.sql` - Complete migration script

### Phase 2: Service Layer Consistency (High Priority)
**Duration**: 45 minutes

1. Fix all services to use `profiles` table
   - `ingredientService.ts` ✗ uses user_profiles
   - `recipeService.ts` ✓ uses profiles
   - `competitorService.ts` ✓ uses profiles
   - `userSettingsService.ts` - audit needed

2. Create `companyService.ts` for multi-company operations
   ```typescript
   - getUserCompanies(userId)
   - switchCompany(userId, companyId)
   - assignUserToCompany(userId, companyId, role)
   - removeUserFromCompany(userId, companyId)
   ```

3. Update all services to support multi-company context
   - Pass `companyId` explicitly to all service methods
   - Remove reliance on single user.company_id

**Files to Update**:
- `/src/lib/services/ingredientService.ts`
- `/src/lib/services/recipeService.ts`
- `/src/lib/services/competitorService.ts`
- `/src/lib/services/userSettingsService.ts`
- All other services

**Files to Create**:
- `/src/lib/services/companyService.ts`
- `/src/lib/services/calculatorSettingsService.ts`

### Phase 3: Remove Hardcoded Data (Medium Priority)
**Duration**: 1 hour

1. Migrate constants to database
   - Move platform commissions to `calculator_settings`
   - Move profit thresholds to `calculator_settings`
   - Move pricing strategies to `calculator_settings`

2. Create settings service
   ```typescript
   calculatorSettingsService.ts:
   - getSettings(companyId, category)
   - updateSetting(settingId, value)
   - getCommission(companyId, platform)
   ```

3. Update components to fetch settings from database
   - Menu calculators
   - Pricing components
   - Dashboard components

4. Remove hardcoded files (after migration complete)
   - Delete `/src/lib/data/constants.ts` (keep brand info)
   - Delete `/src/lib/data/categories.ts` (use categoriesService)

**Files to Update**:
- All components using hardcoded constants
- All components using hardcoded categories

**Files to Delete** (after verification):
- `/src/lib/data/constants.ts` (or refactor to keep only brand info)
- `/src/lib/data/categories.ts`

### Phase 4: Settings Page Refactor (Medium Priority)
**Duration**: 1 hour

1. Create CompanySelector component
   ```tsx
   <CompanySelector
     companies={userCompanies}
     activeCompany={currentCompany}
     onSelect={handleCompanySwitch}
   />
   ```

2. Update Settings page structure
   ```tsx
   Tabs:
   - General (user preferences: language, timezone)
   - Profile (user info: name, email, phone)
   - Companies (list of assigned companies)
   - Company Settings (active company settings)
   - Notifications (per-company notification prefs)
   - Security (2FA, password)
   ```

3. Create company context provider
   ```typescript
   CompanyContext:
   - currentCompany
   - userCompanies
   - switchCompany(companyId)
   ```

**Files to Create**:
- `/src/components/settings/CompanySelector.tsx`
- `/src/contexts/CompanyContext.tsx`

**Files to Update**:
- `/src/app/dashboard/settings/page.tsx`

### Phase 5: Admin Dashboard Completion (High Priority)
**Duration**: 2 hours

1. Update admin dashboard with dynamic stats
   ```typescript
   - Total companies (count from companies table)
   - Active users (count from profiles where is_active=true)
   - Total products (count from products)
   - Total ingredients (count from ingredients)
   - System health (database size, active sessions)
   ```

2. Create admin ingredients CRUD
   ```tsx
   /admin/ingredients:
   - List all ingredients (all companies)
   - Filter by company
   - Create/edit/delete ingredients
   - Bulk import from CSV
   - Price history view
   ```

3. Create admin products CRUD
   ```tsx
   /admin/products:
   - List all products (all companies)
   - Filter by company
   - Create/edit/delete products
   - Bulk operations
   - Product analytics
   ```

4. Enhance admin recipes page
   ```tsx
   /admin/recipes:
   - Complete CRUD operations
   - Recipe templates (system-wide)
   - Recipe cost analysis
   ```

5. Create admin users management
   ```tsx
   /admin/users:
   - List all users
   - Assign to companies (multi-select)
   - Role management per company
   - Activity logs
   ```

**Files to Create**:
- `/src/app/dashboard/admin/ingredients/page.tsx`
- `/src/app/dashboard/admin/products/page.tsx`
- `/src/components/admin/IngredientForm.tsx`
- `/src/components/admin/ProductForm.tsx`
- `/src/components/admin/UserCompanyAssignment.tsx`

**Files to Update**:
- `/src/app/dashboard/admin/page.tsx` (fix stats)
- `/src/app/dashboard/admin/users/page.tsx` (add company assignment)

### Phase 6: Landing Page Creation (Medium Priority)
**Duration**: 2 hours

Create professional bilingual landing page at `/`:

**Structure**:
```tsx
Landing Page Sections:
1. Hero Section
   - Problem: Rising food costs, shrinking margins
   - Solution: Smart food cost calculator
   - CTA: "Începe Acum" / "Start Now"

2. Benefits Section
   - Real-time cost tracking
   - Multi-location support
   - Menu optimization
   - Profit margin analysis

3. Features Showcase
   - Food Cost Management
   - Menu Calculators (Online/Offline/Catering)
   - Competitor Analysis
   - Supplier Management

4. ROI Calculator Widget
   - Input: Monthly revenue, food cost %
   - Output: Potential savings with optimization

5. How It Works
   - Step 1: Add ingredients
   - Step 2: Create recipes
   - Step 3: Generate menus
   - Step 4: Track profits

6. Testimonials / Social Proof
   - "Helped us reduce food cost by 8%"
   - "Saves 10 hours per week"

7. Pricing Section
   - Free trial
   - Pro features
   - Enterprise

8. FAQ Section
   - Romanian market specific
   - Integration questions
   - Support info

9. Final CTA
   - Sign up form
   - Demo request

10. Footer
    - Links to dashboard
    - Contact info
    - Legal pages
```

**Components to Create**:
- `/src/components/landing/Hero.tsx`
- `/src/components/landing/Benefits.tsx`
- `/src/components/landing/Features.tsx`
- `/src/components/landing/ROICalculator.tsx`
- `/src/components/landing/HowItWorks.tsx`
- `/src/components/landing/Testimonials.tsx`
- `/src/components/landing/Pricing.tsx`
- `/src/components/landing/FAQ.tsx`
- `/src/components/landing/LanguageToggle.tsx`

**Pages to Create**:
- `/src/app/page.tsx` (replace current with landing page)

**Translations to Add**:
- Add all landing page text to `/src/lib/i18n/translations.ts`
- Romanian (primary)
- English (secondary)

### Phase 7: Testing & Verification (Critical)
**Duration**: 1 hour

1. Multi-tenancy testing
   - Create test users with multiple companies
   - Verify data isolation
   - Test admin cross-company access
   - Verify RLS policies work correctly

2. Database migration testing
   - Run migrations on test database
   - Verify data integrity
   - Test rollback procedures

3. Component testing
   - Settings page with multiple companies
   - Admin dashboard with real data
   - Landing page on mobile/desktop
   - Calculator settings from database

4. Performance testing
   - Query performance with indexes
   - Large dataset handling
   - RLS policy overhead

## Migration Strategy

### Option A: Fresh Database (Recommended for Development)
**Pros**: Clean slate, no migration errors
**Cons**: Lose existing data

**Steps**:
1. Backup existing database
2. Drop all tables
3. Run `supabase_setup.sql`
4. Run `bug_fixes_migration.sql`
5. Run `multi_tenancy_refactor.sql`
6. Create test data

### Option B: In-Place Migration (Production)
**Pros**: Preserve existing data
**Cons**: Complex migration, potential errors

**Steps**:
1. Backup database
2. Create `user_companies` table
3. Migrate `profiles.company_id` to `user_companies`
4. Update RLS policies
5. Run data migrations for settings/categories
6. Update application code
7. Test thoroughly before deploying

## Dependencies & Risks

### Dependencies
- Supabase database access
- Admin credentials for migrations
- Testing environment
- Translation review (Romanian native speaker)

### Risks
1. **Data Loss**: Migrations could corrupt existing data
   - Mitigation: Full backup before any changes

2. **RLS Policy Errors**: Changes could break data access
   - Mitigation: Test RLS policies in staging first

3. **Breaking Changes**: Service updates could break calculators
   - Mitigation: Don't touch working calculator components

4. **Translation Quality**: Romanian text might be inaccurate
   - Mitigation: Review with native speaker before launch

## Success Criteria

✅ **Phase 1 Success**:
- [ ] Multi-company junction table created
- [ ] Users can belong to multiple companies
- [ ] RLS policies updated and working

✅ **Phase 2 Success**:
- [ ] All services use `profiles` table
- [ ] No references to `user_profiles` table
- [ ] Multi-company context working

✅ **Phase 3 Success**:
- [ ] All hardcoded constants moved to database
- [ ] Components fetch settings from database
- [ ] Hardcoded files removed

✅ **Phase 4 Success**:
- [ ] Settings page shows all user companies
- [ ] Company switching works
- [ ] Per-company settings functional

✅ **Phase 5 Success**:
- [ ] Admin dashboard shows real stats
- [ ] Ingredients CRUD complete
- [ ] Products CRUD complete
- [ ] User-company assignment working

✅ **Phase 6 Success**:
- [ ] Landing page live at `/`
- [ ] Bilingual (RO/EN) working
- [ ] ROI calculator functional
- [ ] Mobile responsive
- [ ] SEO optimized

✅ **Phase 7 Success**:
- [ ] All tests passing
- [ ] No RLS policy violations
- [ ] Performance acceptable
- [ ] No TypeScript errors

## Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Database Schema | 30 min | HIGH |
| Phase 2: Service Consistency | 45 min | HIGH |
| Phase 3: Remove Hardcoded Data | 1 hour | MEDIUM |
| Phase 4: Settings Page | 1 hour | MEDIUM |
| Phase 5: Admin Dashboard | 2 hours | HIGH |
| Phase 6: Landing Page | 2 hours | MEDIUM |
| Phase 7: Testing | 1 hour | CRITICAL |
| **TOTAL** | **8 hours 15 min** | |

## Next Steps

1. ✅ Review and approve this refactoring plan
2. Choose migration strategy (fresh vs in-place)
3. Backup existing database
4. Begin Phase 1: Database schema fixes
5. Proceed sequentially through phases
6. Test thoroughly at each phase
7. Deploy to production

---

**Document Version**: 1.0
**Last Updated**: 2025-10-27
**Author**: Claude Code
**Status**: PENDING APPROVAL
