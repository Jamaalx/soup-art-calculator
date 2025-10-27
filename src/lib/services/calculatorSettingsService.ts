import { createClient } from '@/lib/supabase/client';

export interface CalculatorSetting {
  id: string;
  company_id?: string;
  setting_key: string;
  setting_category: string;
  label: string;
  description?: string;
  value_type: 'fixed_amount' | 'percentage' | 'number' | 'text';
  value_number?: number;
  value_text?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_category: string;
  label: string;
  description?: string;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
  value_json?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

export const calculatorSettingsService = {
  /**
   * Get all calculator settings for a company
   */
  async getCompanySettings(companyId: string, category?: string): Promise<CalculatorSetting[]> {
    let query = supabase
      .from('calculator_settings')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('sort_order');

    if (category) {
      query = query.eq('setting_category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific setting by key
   */
  async getSetting(companyId: string, settingKey: string): Promise<CalculatorSetting | null> {
    const { data, error } = await supabase
      .from('calculator_settings')
      .select('*')
      .eq('company_id', companyId)
      .eq('setting_key', settingKey)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get platform commission for online orders
   */
  async getPlatformCommission(companyId: string, platform: string): Promise<number> {
    const settingKey = `${platform.toLowerCase()}_commission`;
    const setting = await this.getSetting(companyId, settingKey);
    return setting?.value_number || 0;
  },

  /**
   * Get all platform commissions for a company
   */
  async getAllPlatformCommissions(companyId: string): Promise<Record<string, number>> {
    const platforms = ['glovo', 'bolt', 'wolt', 'tazz', 'uber'];
    const commissions: Record<string, number> = {};

    const settings = await this.getCompanySettings(companyId, 'online');

    platforms.forEach(platform => {
      const setting = settings.find(s => s.setting_key === `${platform}_commission`);
      commissions[platform] = setting?.value_number || 0;
    });

    return commissions;
  },

  /**
   * Get packaging and processing costs
   */
  async getOnlineCosts(companyId: string): Promise<{
    packagingCost: number;
    processingCost: number;
  }> {
    const settings = await this.getCompanySettings(companyId, 'online');

    const packagingSetting = settings.find(s => s.setting_key === 'online_packaging_cost');
    const processingSetting = settings.find(s => s.setting_key === 'online_processing_cost');

    return {
      packagingCost: packagingSetting?.value_number || 0,
      processingCost: processingSetting?.value_number || 0
    };
  },

  /**
   * Get menu limits
   */
  async getMenuLimits(companyId: string): Promise<{
    minItems: number;
    maxItems: number;
  }> {
    const settings = await this.getCompanySettings(companyId, 'limits');

    const minSetting = settings.find(s => s.setting_key === 'menu_min_items');
    const maxSetting = settings.find(s => s.setting_key === 'menu_max_items');

    return {
      minItems: minSetting?.value_number || 20,
      maxItems: maxSetting?.value_number || 100
    };
  },

  /**
   * Update a calculator setting
   */
  async updateSetting(
    settingId: string,
    updates: Partial<CalculatorSetting>
  ): Promise<CalculatorSetting> {
    const { data, error } = await supabase
      .from('calculator_settings')
      .update(updates)
      .eq('id', settingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new calculator setting
   */
  async createSetting(
    setting: Omit<CalculatorSetting, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CalculatorSetting> {
    const { data, error } = await supabase
      .from('calculator_settings')
      .insert(setting)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a calculator setting (soft delete)
   */
  async deleteSetting(settingId: string): Promise<void> {
    const { error } = await supabase
      .from('calculator_settings')
      .update({ is_active: false })
      .eq('id', settingId);

    if (error) throw error;
  },

  // ============================================================================
  // SYSTEM SETTINGS (Global, not company-specific)
  // ============================================================================

  /**
   * Get all system settings
   */
  async getSystemSettings(category?: string): Promise<SystemSetting[]> {
    let query = supabase
      .from('system_settings')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('setting_category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific system setting by key
   */
  async getSystemSetting(settingKey: string): Promise<SystemSetting | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get profit thresholds
   */
  async getProfitThresholds(): Promise<{
    excellent: number;
    good: number;
    acceptable: number;
    low: number;
  }> {
    const settings = await this.getSystemSettings('thresholds');

    const excellent = settings.find(s => s.setting_key === 'profit_threshold_excellent');
    const good = settings.find(s => s.setting_key === 'profit_threshold_good');
    const acceptable = settings.find(s => s.setting_key === 'profit_threshold_acceptable');
    const low = settings.find(s => s.setting_key === 'profit_threshold_low');

    return {
      excellent: excellent?.value_number || 100,
      good: good?.value_number || 80,
      acceptable: acceptable?.value_number || 50,
      low: low?.value_number || 30
    };
  },

  /**
   * Get pricing strategies
   */
  async getPricingStrategies(): Promise<{
    conservative: number;
    optimal: number;
    competitive: number;
  }> {
    const settings = await this.getSystemSettings('pricing');

    const conservative = settings.find(s => s.setting_key === 'pricing_strategy_conservative');
    const optimal = settings.find(s => s.setting_key === 'pricing_strategy_optimal');
    const competitive = settings.find(s => s.setting_key === 'pricing_strategy_competitive');

    return {
      conservative: conservative?.value_number || 2.20,
      optimal: optimal?.value_number || 2.00,
      competitive: competitive?.value_number || 1.80
    };
  },

  /**
   * Get cost categories
   */
  async getCostCategories(): Promise<{
    economic: { max: number; color: string; label: string };
    mediu: { min: number; max: number; color: string; label: string };
    premium: { min: number; color: string; label: string };
  }> {
    const setting = await this.getSystemSetting('cost_categories');

    if (setting?.value_json) {
      return setting.value_json as any;
    }

    // Default fallback
    return {
      economic: { max: 15, color: 'green', label: 'Economic' },
      mediu: { min: 15, max: 20, color: 'yellow', label: 'Medium' },
      premium: { min: 20, color: 'blue', label: 'Premium' }
    };
  },

  /**
   * Get brand information
   */
  async getBrandInfo(): Promise<{
    name: string;
    website: string;
    email: string;
    tagline: string;
  }> {
    const setting = await this.getSystemSetting('brand_info');

    if (setting?.value_json) {
      return setting.value_json as any;
    }

    // Default fallback
    return {
      name: 'CLIENTII ZED-ZEN',
      website: 'https://soup-art-calculator.com',
      email: 'contact@zed-zen.com',
      tagline: 'Professional Food Cost Management'
    };
  },

  /**
   * Update a system setting (admin only)
   */
  async updateSystemSetting(
    settingId: string,
    updates: Partial<SystemSetting>
  ): Promise<SystemSetting> {
    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can update system settings');
    }

    const { data, error } = await supabase
      .from('system_settings')
      .update(updates)
      .eq('id', settingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Initialize default settings for a new company
   */
  async initializeCompanySettings(companyId: string): Promise<void> {
    const defaultSettings = [
      // Online platform commissions
      {
        company_id: companyId,
        setting_key: 'glovo_commission',
        setting_category: 'online',
        label: 'Glovo Commission',
        description: 'Commission percentage for Glovo platform',
        value_type: 'percentage' as const,
        value_number: 17.00,
        sort_order: 1,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'bolt_commission',
        setting_category: 'online',
        label: 'Bolt Food Commission',
        description: 'Commission percentage for Bolt Food platform',
        value_type: 'percentage' as const,
        value_number: 15.00,
        sort_order: 2,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'wolt_commission',
        setting_category: 'online',
        label: 'Wolt Commission',
        description: 'Commission percentage for Wolt platform',
        value_type: 'percentage' as const,
        value_number: 15.00,
        sort_order: 3,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'tazz_commission',
        setting_category: 'online',
        label: 'Tazz Commission',
        description: 'Commission percentage for Tazz platform',
        value_type: 'percentage' as const,
        value_number: 16.00,
        sort_order: 4,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'uber_commission',
        setting_category: 'online',
        label: 'Uber Eats Commission',
        description: 'Commission percentage for Uber Eats platform',
        value_type: 'percentage' as const,
        value_number: 18.00,
        sort_order: 5,
        is_active: true
      },
      // Online costs
      {
        company_id: companyId,
        setting_key: 'online_packaging_cost',
        setting_category: 'online',
        label: 'Packaging Cost',
        description: 'Default packaging cost for online orders',
        value_type: 'fixed_amount' as const,
        value_number: 2.50,
        sort_order: 6,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'online_processing_cost',
        setting_category: 'online',
        label: 'Processing Cost',
        description: 'Default processing cost for online orders',
        value_type: 'fixed_amount' as const,
        value_number: 1.00,
        sort_order: 7,
        is_active: true
      },
      // Offline costs
      {
        company_id: companyId,
        setting_key: 'offline_packaging_cost',
        setting_category: 'offline',
        label: 'Offline Packaging Cost',
        description: 'Packaging cost for offline orders',
        value_type: 'fixed_amount' as const,
        value_number: 0.00,
        sort_order: 1,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'offline_commission',
        setting_category: 'offline',
        label: 'Offline Commission',
        description: 'Commission for offline orders',
        value_type: 'percentage' as const,
        value_number: 0.00,
        sort_order: 2,
        is_active: true
      },
      // Menu limits
      {
        company_id: companyId,
        setting_key: 'menu_min_items',
        setting_category: 'limits',
        label: 'Minimum Menu Items',
        description: 'Minimum items per menu',
        value_type: 'number' as const,
        value_number: 20,
        sort_order: 10,
        is_active: true
      },
      {
        company_id: companyId,
        setting_key: 'menu_max_items',
        setting_category: 'limits',
        label: 'Maximum Menu Items',
        description: 'Maximum items per menu',
        value_type: 'number' as const,
        value_number: 100,
        sort_order: 11,
        is_active: true
      }
    ];

    const { error } = await supabase
      .from('calculator_settings')
      .insert(defaultSettings);

    if (error) throw error;
  }
};
