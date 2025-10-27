import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  currency: string;
  date_format: string;
  time_zone: string;
  email_notifications: boolean;
  cost_alerts: boolean;
  weekly_reports: boolean;
  order_reminders: boolean;
  two_factor_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  restaurant_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      language: 'en',
      currency: 'RON',
      date_format: 'DD/MM/YYYY',
      time_zone: 'Europe/Bucharest',
      email_notifications: true,
      cost_alerts: true,
      weekly_reports: false,
      order_reminders: true,
      two_factor_enabled: false
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
        ...updates,
        is_active: updates.is_active ?? true
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