# Database Migrations

This folder contains SQL migration files for creating and updating database tables.

## Migration Files

- `001_create_units_table.sql` - Creates the `units` table for measurement units
- `002_create_user_settings_table.sql` - Creates the `user_settings` table for user preferences

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order
4. Click **Run** to execute

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Run a specific migration
supabase db execute --file migrations/001_create_units_table.sql

# Or run all migrations in order
supabase db execute --file migrations/001_create_units_table.sql
supabase db execute --file migrations/002_create_user_settings_table.sql
```

### Option 3: Using psql

If you have direct database access:

```bash
psql -h your-database-host -U postgres -d your-database-name -f migrations/001_create_units_table.sql
psql -h your-database-host -U postgres -d your-database-name -f migrations/002_create_user_settings_table.sql
```

## Migration Order

**IMPORTANT:** Run migrations in numerical order (001, 002, etc.) to ensure dependencies are met.

## What Each Migration Creates

### 001_create_units_table.sql
Creates the `units` table with:
- Support for weight, volume, count, length, and other unit types
- System-wide units (shared across all companies)
- Company-specific custom units
- Unit conversion factors for automatic conversion
- 15 default system units (kg, g, l, ml, cups, etc.)
- Row Level Security (RLS) policies

### 002_create_user_settings_table.sql
Creates the `user_settings` table with:
- User localization preferences (language, currency, date format, timezone)
- Notification preferences (email, alerts, reports, reminders)
- Security settings (two-factor authentication)
- Row Level Security (RLS) policies
- Auto-updating `updated_at` trigger

## After Running Migrations

After running the migrations, you need to regenerate your TypeScript types:

```bash
# Using Supabase CLI
supabase gen types typescript --local > src/lib/supabase/database.ts

# Or from your Supabase project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.ts
```

This ensures your TypeScript code has the correct types for the new tables.

## Rollback

If you need to remove these tables:

```sql
-- Drop tables (be careful - this deletes all data!)
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
```

## Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access data relevant to them
- System units (company_id IS NULL) are visible to all users
- Company-specific units are only visible to that company's users
