// services/companySettingsService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface CompanySetting {
  id?: string;
  company_id?: string;
  setting_key: string;
  setting_category: string;  // ✅ Changed from union type to string
  label: string;
  description?: string | null;  // ✅ Allow null
  value_type: string;  // ✅ Changed from union type to string
  value_number?: number | null;  // ✅ Allow null
  value_text?: string | null;  // ✅ Allow null
  value_boolean?: boolean | null;  // ✅ Allow null
  sort_order?: number | null;  // ✅ Allow null
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  company_name: string;
  slug: string;
  owner_user_id: string | null;  // ✅ Allow null
  cui: string | null;             // ✅ Allow null
  address: string | null;         // ✅ Allow null
  phone: string | null;           // ✅ Allow null
  email: string | null;           // ✅ Allow null
  is_active: boolean;
  subscription_tier: string | null;  // ✅ Allow null
  created_at: string;
  updated_at: string;
}

class CompanySettingsService {
  // Get current user's company
  async getCurrentCompany(): Promise<{ data: Company | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      // Get user's profile to find company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        return { data: null, error: profileError || { message: 'No company assigned' } };
      }

      // Get company details
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get all settings for current company
  async getAllSettings(): Promise<{ data: CompanySetting[]; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_all_company_settings');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get settings by category
  async getSettingsByCategory(
    category: string  // ✅ Changed from union type to string
  ): Promise<{ data: CompanySetting[]; error: any }> {
    try {
      const { data: allSettings, error } = await this.getAllSettings();
      
      if (error) return { data: [], error };

      const filtered = allSettings.filter(s => s.setting_category === category);
      return { data: filtered, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get specific setting value
  async getSetting(settingKey: string): Promise<{ data: CompanySetting | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_company_setting', { p_setting_key: settingKey });

      if (error || !data || data.length === 0) {
        return { data: null, error: error || { message: 'Setting not found' } };
      }

      // Transform the RPC result to match CompanySetting interface
      const result = data[0];
      const setting: CompanySetting = {
        setting_key: result.setting_key,
        setting_category: '', // RPC doesn't return this, but we don't need it here
        label: result.label,
        value_type: '', // RPC doesn't return this, but we don't need it here
        value_number: result.value_number ?? undefined,
        value_text: result.value_text ?? undefined,
        value_boolean: result.value_boolean ?? undefined,
      };

      return { data: setting, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get setting value as number
  async getSettingNumber(settingKey: string, defaultValue: number = 0): Promise<number> {
    const { data } = await this.getSetting(settingKey);
    return data?.value_number ?? defaultValue;
  }

  // Get setting value as text
  async getSettingText(settingKey: string, defaultValue: string = ''): Promise<string> {
    const { data } = await this.getSetting(settingKey);
    return data?.value_text ?? defaultValue;
  }

  // Get setting value as boolean
  async getSettingBoolean(settingKey: string, defaultValue: boolean = false): Promise<boolean> {
    const { data } = await this.getSetting(settingKey);
    return data?.value_boolean ?? defaultValue;
  }

  // Update a setting
  async updateSetting(
    settingKey: string,
    value: number | string | boolean
  ): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        return { error: { message: 'No company assigned' } };
      }

      // Determine which field to update based on value type
      const updateData: any = {};
      if (typeof value === 'number') {
        updateData.value_number = value;
      } else if (typeof value === 'boolean') {
        updateData.value_boolean = value;
      } else {
        updateData.value_text = value;
      }

      const { error } = await supabase
        .from('calculator_settings')
        .update(updateData)
        .eq('company_id', profile.company_id)
        .eq('setting_key', settingKey);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Create a new custom setting
  async createSetting(setting: CompanySetting): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        return { error: { message: 'No company assigned' } };
      }

      if (profile.role !== 'admin') {
        return { error: { message: 'Only admins can create settings' } };
      }

      const { error } = await supabase
        .from('calculator_settings')
        .insert({
          company_id: profile.company_id,
          setting_key: setting.setting_key,
          setting_category: setting.setting_category,
          label: setting.label,
          description: setting.description,
          value_type: setting.value_type,
          value_number: setting.value_number,
          value_text: setting.value_text,
          value_boolean: setting.value_boolean,
          sort_order: setting.sort_order ?? 999,
          is_active: true
        });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Delete a custom setting
  async deleteSetting(settingKey: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        return { error: { message: 'No company assigned' } };
      }

      if (profile.role !== 'admin') {
        return { error: { message: 'Only admins can delete settings' } };
      }

      const { error } = await supabase
        .from('calculator_settings')
        .update({ is_active: false })
        .eq('company_id', profile.company_id)
        .eq('setting_key', settingKey);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Helper: Get online calculator config
  async getOnlineCalculatorConfig() {
    const { data: settings } = await this.getSettingsByCategory('online');
    
    return {
      appCommission: settings.find(s => s.setting_key === 'online_app_commission')?.value_number,
      packagingCost: settings.find(s => s.setting_key === 'online_packaging_cost')?.value_number
    };
  }

  // Helper: Get catering calculator config
  async getCateringCalculatorConfig() {
    const { data: settings } = await this.getSettingsByCategory('catering');
    
    return {
      transportCost: settings.find(s => s.setting_key === 'catering_transport_cost')?.value_number,
      packagingCost: settings.find(s => s.setting_key === 'catering_packaging_cost')?.value_number
    };
  }

  // Helper: Get general config
  async getGeneralConfig() {
    const { data: settings } = await this.getSettingsByCategory('general');
    
    return {
      defaultProfitMargin: settings.find(s => s.setting_key === 'default_profit_margin')?.value_number,
      vatRate: settings.find(s => s.setting_key === 'vat_rate')?.value_number
    };
  }
}

export const companySettingsService = new CompanySettingsService();