import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UserSettings {
  id: string;
  user_id: string;
  company_id?: string | null;
  language: string;
  currency: string;
  date_format: string;
  time_format: string;
  timezone: string; // Renamed from time_zone to match database
  number_format: string;
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields (can be removed if not used)
  time_zone?: string; // Maps to timezone
  cost_alerts?: boolean; // Can be stored in preferences JSON
  weekly_reports?: boolean; // Can be stored in preferences JSON
  order_reminders?: boolean; // Can be stored in preferences JSON
  two_factor_enabled?: boolean; // Can be stored in preferences JSON
}

export interface UserProfile {
  id: string;
  user_id: string;
  company_id?: string | null;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: string;
  is_active: boolean;
  preferences?: any | null; // JSON field for additional data
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields (can be computed from full_name)
  first_name?: string;
  last_name?: string;
  restaurant_name?: string; // Can be stored in preferences
}

export const userSettingsService = {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    return data;
  },

  // Create default settings for new user
  async createDefaultSettings(userId: string, companyId?: string): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      company_id: companyId || null,
      language: 'en',
      currency: 'RON',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      timezone: 'Europe/Bucharest',
      number_format: '1,234.56',
      theme: 'light',
      email_notifications: true,
      sms_notifications: false
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserSettings> {
    // Check if settings exist
    let existingSettings = await this.getUserSettings(userId);
    
    if (!existingSettings) {
      // Create default settings first
      existingSettings = await this.createDefaultSettings(userId);
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    // Try to update first
    const { data: existingData } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingData) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        email: updates.email || '',
        ...updates
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  },

  // Enable/disable two-factor authentication
  async toggleTwoFactor(userId: string, enabled: boolean): Promise<void> {
    await this.updateUserSettings(userId, { two_factor_enabled: enabled });
    
    // Here you would integrate with your 2FA service
    // For now, we just update the setting
  },

  // Get combined user data (profile + settings)
  async getUserData(userId: string): Promise<{ profile: UserProfile | null; settings: UserSettings | null }> {
    const [profile, settings] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserSettings(userId)
    ]);

    return { profile, settings };
  }
};