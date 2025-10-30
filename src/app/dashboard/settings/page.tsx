'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Globe, Save, Loader } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserSettings, useUserProfile, usePasswordChange, useTwoFactor } from '@/lib/hooks/useUserSettings';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // Get current user ID (this should come from auth context)
  const userId = 'default-user'; // This should come from your auth system
  
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings(userId);
  const { profile, loading: profileLoading, updateProfile } = useUserProfile(userId);
  const { changePassword, loading: passwordLoading } = usePasswordChange();
  const { toggleTwoFactor, loading: twoFactorLoading } = useTwoFactor(userId);
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    language: 'en',
    currency: 'RON',
    date_format: 'DD/MM/YYYY',
    time_zone: 'Europe/Bucharest'
  });
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    restaurant_name: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    cost_alerts: true,
    weekly_reports: false,
    order_reminders: true
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Update form states when data loads
  useEffect(() => {
    if (settings) {
      setGeneralSettings({
        language: settings.language,
        currency: settings.currency,
        date_format: settings.date_format,
        time_zone: settings.time_zone ?? 'Europe/Bucharest'
      });

      setNotificationSettings({
        email_notifications: settings.email_notifications,
        cost_alerts: settings.cost_alerts ?? true,
        weekly_reports: settings.weekly_reports ?? false,
        order_reminders: settings.order_reminders ?? true
      });
    }
  }, [settings]);
  
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        restaurant_name: profile.restaurant_name || ''
      });
    }
  }, [profile]);
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save settings and profile
      await Promise.all([
        updateSettings({ ...generalSettings, ...notificationSettings }),
        updateProfile(profileData)
      ]);
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    }
  };
  
  const handleToggleTwoFactor = async () => {
    try {
      await toggleTwoFactor(!settings?.two_factor_enabled);
      // Refresh settings to get updated state
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle two-factor:', error);
      alert('Failed to toggle two-factor authentication.');
    }
  };
  
  const isLoading = settingsLoading || profileLoading;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-slate-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                {t('settings').toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2">{t('settings')}</h1>
            <p className="text-gray-100">
              Manage your account preferences and application settings
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <div className="w-64">
                      <LanguageSwitcher />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select 
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="RON">Romanian Leu (RON)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select 
                      value={generalSettings.date_format}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, date_format: e.target.value }))}
                      className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select 
                      value={generalSettings.time_zone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, time_zone: e.target.value }))}
                      className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="Europe/Bucharest">Europe/Bucharest</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Cost Alerts</h4>
                      <p className="text-sm text-gray-600">Alert when ingredient costs change significantly</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-600">Receive weekly business performance reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Order Reminders</h4>
                      <p className="text-sm text-gray-600">Remind about pending supplier orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-yellow-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-yellow-800">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : `${t('save') || 'Save'} Changes`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}