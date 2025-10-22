-- Create units table for managing measurement units
-- Supports both system-wide units and company-specific custom units

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weight', 'volume', 'count', 'length', 'other')),
  base_unit TEXT, -- For conversion purposes (e.g., 'g' for grams, 'ml' for milliliters)
  conversion_factor NUMERIC, -- How many base units this represents
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE, -- NULL for system-wide units
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Ensure unique unit names within company scope (system-wide or per company)
  UNIQUE(name, company_id),
  UNIQUE(abbreviation, company_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_units_type ON public.units(type);
CREATE INDEX IF NOT EXISTS idx_units_company_id ON public.units(company_id);
CREATE INDEX IF NOT EXISTS idx_units_is_active ON public.units(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view system-wide units (company_id IS NULL) and their company's units
CREATE POLICY "Users can view system and company units" ON public.units
  FOR SELECT
  USING (
    company_id IS NULL OR
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert custom units for their company
CREATE POLICY "Users can create company units" ON public.units
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their company's units (not system units)
CREATE POLICY "Users can update company units" ON public.units
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete their company's units (not system units)
CREATE POLICY "Users can delete company units" ON public.units
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Insert default system-wide units
INSERT INTO public.units (name, abbreviation, type, base_unit, conversion_factor, is_active, company_id) VALUES
  -- Weight units
  ('Kilograms', 'kg', 'weight', 'g', 1000, true, NULL),
  ('Grams', 'g', 'weight', 'g', 1, true, NULL),
  ('Pounds', 'lb', 'weight', 'g', 453.592, true, NULL),
  ('Ounces', 'oz', 'weight', 'g', 28.3495, true, NULL),

  -- Volume units
  ('Liters', 'l', 'volume', 'ml', 1000, true, NULL),
  ('Milliliters', 'ml', 'volume', 'ml', 1, true, NULL),
  ('Cups', 'cup', 'volume', 'ml', 240, true, NULL),
  ('Tablespoons', 'tbsp', 'volume', 'ml', 15, true, NULL),
  ('Teaspoons', 'tsp', 'volume', 'ml', 5, true, NULL),

  -- Count units
  ('Pieces', 'piece', 'count', 'piece', 1, true, NULL),
  ('Dozen', 'dz', 'count', 'piece', 12, true, NULL),
  ('Pack', 'pack', 'count', 'piece', 1, true, NULL),

  -- Other common units
  ('Cloves (garlic)', 'clove', 'count', 'piece', 1, true, NULL),
  ('Leaves', 'leaf', 'count', 'piece', 1, true, NULL),
  ('Pinch', 'pinch', 'volume', 'ml', 0.3, true, NULL)
ON CONFLICT (name, company_id) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE public.units IS 'Measurement units for ingredients and recipes. Supports both system-wide and company-specific units.';
