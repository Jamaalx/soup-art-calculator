-- Create user_settings table for storing user preferences and settings
-- One row per user with their personalized settings

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Localization settings
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ro')),
  currency TEXT NOT NULL DEFAULT 'RON',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  time_zone TEXT NOT NULL DEFAULT 'Europe/Bucharest',

  -- Notification preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  cost_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_reports BOOLEAN NOT NULL DEFAULT false,
  order_reminders BOOLEAN NOT NULL DEFAULT true,

  -- Security settings
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can create own settings" ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings" ON public.user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_settings_updated_at();

-- Add comment to table
COMMENT ON TABLE public.user_settings IS 'User-specific settings and preferences for the application.';
