// hooks/useCompanySettings.ts
import { useState, useEffect } from 'react';
import { companySettingsService, CompanySetting, Company } from '../../services/companySettingsService';

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySetting[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error: err } = await companySettingsService.getAllSettings();
    
    if (err) {
      setError(err);
    } else {
      setSettings(data);
    }
    
    setLoading(false);
  };

  const fetchCompany = async () => {
    const { data, error: err } = await companySettingsService.getCurrentCompany();
    
    if (err) {
      setError(err);
    } else {
      setCompany(data);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCompany();
  }, []);

  const getSetting = (settingKey: string): CompanySetting | undefined => {
    return settings.find(s => s.setting_key === settingKey);
  };

  const getSettingValue = (settingKey: string, defaultValue: any = null): any => {
    const setting = getSetting(settingKey);
    if (!setting) return defaultValue;

    switch (setting.value_type) {
      case 'percentage':
      case 'fixed_amount':
        return setting.value_number ?? defaultValue;
      case 'boolean':
        return setting.value_boolean ?? defaultValue;
      case 'text':
        return setting.value_text ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  const getSettingsByCategory = (category: string): CompanySetting[] => {
    return settings.filter(s => s.setting_category === category);
  };

  const updateSetting = async (settingKey: string, value: number | string | boolean) => {
    const { error: err } = await companySettingsService.updateSetting(settingKey, value);
    
    if (err) {
      setError(err);
      return false;
    }
    
    // Refresh settings
    await fetchSettings();
    return true;
  };

  return {
    settings,
    company,
    loading,
    error,
    getSetting,
    getSettingValue,
    getSettingsByCategory,
    updateSetting,
    refresh: fetchSettings
  };
}

// Specialized hooks for each calculator type

export function useOnlineCalculatorSettings() {
  const { settings, loading, getSettingValue } = useCompanySettings();

  return {
    appCommission: getSettingValue('online_app_commission'),
    packagingCost: getSettingValue('online_packaging_cost'),
    loading,
    settings: settings.filter(s => s.setting_category === 'online')
  };
}

export function useCateringCalculatorSettings() {
  const { settings, loading, getSettingValue } = useCompanySettings();

  return {
    transportCost: getSettingValue('catering_transport_cost'),
    packagingCost: getSettingValue('catering_packaging_cost'),
    loading,
    settings: settings.filter(s => s.setting_category === 'catering')
  };
}

export function useOfflineCalculatorSettings() {
  const { settings, loading, getSettingValue } = useCompanySettings();

  return {
    // Add offline-specific settings here as needed
    loading,
    settings: settings.filter(s => s.setting_category === 'offline')
  };
}

export function useGeneralSettings() {
  const { settings, loading, getSettingValue } = useCompanySettings();

  return {
    defaultProfitMargin: getSettingValue('default_profit_margin'),
    vatRate: getSettingValue('vat_rate'),
    loading,
    settings: settings.filter(s => s.setting_category === 'general')
  };
}