'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  company_name: string;
  slug: string;
  owner_user_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cui: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CalculatorSetting {
  id?: string;
  company_id?: string | null;
  setting_key: string;
  setting_category: string;
  label: string;
  description: string | null;
  value_type: string;
  value_number: number;
  sort_order: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompanyForSettings, setSelectedCompanyForSettings] = useState<Company | null>(null);
  const [companySettings, setCompanySettings] = useState<CalculatorSetting[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    cui: ''
  });

  // Default calculator settings for new companies
  const defaultSettings = [
    {
      setting_key: 'default_profit_margin',
      setting_category: 'general',
      label: 'Marjă Profit Implicită',
      description: 'Marjă de profit dorită (%)',
      value_type: 'percentage',
      value_number: 100.00,
      sort_order: 1,
      is_active: true
    },
    {
      setting_key: 'vat_rate',
      setting_category: 'general',
      label: 'Cotă TVA',
      description: 'TVA aplicabil (%)',
      value_type: 'percentage',
      value_number: 19.00,
      sort_order: 2,
      is_active: true
    },
    {
      setting_key: 'online_app_commission',
      setting_category: 'online',
      label: 'Comision Glovo/Bolt/Wolt',
      description: 'Comision aplicații de livrare (%)',
      value_type: 'percentage',
      value_number: 35.00,
      sort_order: 1,
      is_active: true
    },
    {
      setting_key: 'online_packaging_cost',
      setting_category: 'online',
      label: 'Cost Ambalaj Online',
      description: 'Cost ambalaj per comandă (LEI)',
      value_type: 'fixed_amount',
      value_number: 3.00,
      sort_order: 2,
      is_active: true
    },
    {
      setting_key: 'catering_transport_cost',
      setting_category: 'catering',
      label: 'Cost Transport Catering',
      description: 'Cost transport per comandă (LEI)',
      value_type: 'fixed_amount',
      value_number: 1.00,
      sort_order: 1,
      is_active: true
    },
    {
      setting_key: 'catering_packaging_cost',
      setting_category: 'catering',
      label: 'Cost Ambalaj Catering',
      description: 'Cost ambalaj per meniu (LEI)',
      value_type: 'fixed_amount',
      value_number: 2.00,
      sort_order: 2,
      is_active: true
    }
  ];

  const [settingsFormData, setSettingsFormData] = useState<CalculatorSetting[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in');
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchCompanies();
  };

  const fetchCompanies = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching companies:', error);
      alert('Error loading companies: ' + error.message);
    } else {
      setCompanies(data || []);
    }
    
    setLoading(false);
  };

  const fetchCompanySettings = async (companyId: string) => {
    const { data, error } = await supabase
      .from('calculator_settings')
      .select('*')
      .eq('company_id', companyId)
      .order('setting_category')
      .order('sort_order');

    if (error) {
      console.error('Error fetching settings:', error);
      return [];
    }

    return data || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name) {
      alert('Company name is required');
      return;
    }

    const slug = formData.company_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (editingCompany) {
      const { error } = await supabase
        .from('companies')
        .update({
          company_name: formData.company_name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          cui: formData.cui || null
        })
        .eq('id', editingCompany.id);

      if (error) {
        alert('Error updating company: ' + error.message);
        return;
      }
      alert('✅ Company updated successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchCompanies();
    } else {
      // Create company first
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: formData.company_name,
          slug: slug,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          cui: formData.cui || null,
          is_active: true
        })
        .select()
        .single();

      if (companyError || !newCompany) {
        alert('Error creating company: ' + companyError?.message);
        return;
      }

      // CRITICAL FIX: Only send the fields that should be inserted
      const settingsToInsert = settingsFormData.map(setting => ({
        setting_key: setting.setting_key,
        setting_category: setting.setting_category,
        label: setting.label,
        description: setting.description,
        value_type: setting.value_type,
        value_number: setting.value_number,
        sort_order: setting.sort_order,
        is_active: setting.is_active,
        company_id: newCompany.id
      }));

      console.log('Inserting settings:', settingsToInsert);

      const { error: settingsError } = await supabase
        .from('calculator_settings')
        .insert(settingsToInsert);

      if (settingsError) {
        console.error('Error creating settings:', settingsError);
        alert('⚠️ Company created but settings failed: ' + settingsError.message);
      } else {
        alert('✅ Company and settings created successfully!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchCompanies();
    }
  };

  const handleOpenSettingsModal = async (company: Company) => {
    setSelectedCompanyForSettings(company);
    const settings = await fetchCompanySettings(company.id);
    
    if (settings.length === 0) {
      // No settings exist, use defaults
      const defaultsWithCompany: CalculatorSetting[] = defaultSettings.map(s => ({ 
        ...s, 
        company_id: company.id
      }));
      setCompanySettings(defaultsWithCompany);
    }  
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedCompanyForSettings) return;

    const existingSettings = await fetchCompanySettings(selectedCompanyForSettings.id);

    if (existingSettings.length === 0) {
      // Insert new settings - only send necessary fields
      const settingsToInsert = companySettings.map(s => ({
        setting_key: s.setting_key,
        setting_category: s.setting_category,
        label: s.label,
        description: s.description,
        value_type: s.value_type,
        value_number: s.value_number,
        sort_order: s.sort_order,
        is_active: s.is_active,
        company_id: selectedCompanyForSettings.id
      }));

      const { error } = await supabase
        .from('calculator_settings')
        .insert(settingsToInsert);

      if (error) {
        alert('Error creating settings: ' + error.message);
        return;
      }
    } else {
      // Update existing settings
      for (const setting of companySettings) {
        if (setting.id) {
          const { error } = await supabase
            .from('calculator_settings')
            .update({
              value_number: setting.value_number,
              is_active: setting.is_active
            })
            .eq('id', setting.id);

          if (error) {
            console.error('Error updating setting:', error);
          }
        }
      }
    }

    alert('✅ Settings saved successfully!');
    setIsSettingsModalOpen(false);
  };

  const updateSettingValue = (index: number, value: string) => {
    const updated = [...companySettings];
    updated[index].value_number = parseFloat(value) || 0;
    setCompanySettings(updated);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name,
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      cui: company.cui || ''
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('companies')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating company: ' + error.message);
    } else {
      alert(`✅ Company ${!currentStatus ? 'activated' : 'deactivated'}!`);
      fetchCompanies();
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      email: '',
      phone: '',
      address: '',
      cui: ''
    });
    setEditingCompany(null);
    setSettingsFormData(defaultSettings as CalculatorSetting[]);
  };

  useEffect(() => {
    if (isModalOpen && !editingCompany) {
      setSettingsFormData(defaultSettings as CalculatorSetting[]);
    }
  }, [isModalOpen]);

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.is_active).length,
    inactive: companies.filter(c => !c.is_active).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const generalSettings = settingsFormData.filter(s => s.setting_category === 'general');
  const onlineSettings = settingsFormData.filter(s => s.setting_category === 'online');
  const cateringSettings = settingsFormData.filter(s => s.setting_category === 'catering');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">ADMIN</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">COMPANIES</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Companies Management</h1>
            <p className="text-white/90">Manage companies and their calculator settings</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition"
          >
            ➕ Add Company
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Companies</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-black text-green-700">{stats.active}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-md border-2 border-red-200">
          <p className="text-sm text-red-700 mb-1">Inactive</p>
          <p className="text-3xl font-black text-red-700">{stats.inactive}</p>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
            <p className="text-gray-500 text-lg font-bold mb-2">No companies found</p>
            <p className="text-gray-400 text-sm">Click "Add Company" to create your first company</p>
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">{company.company_name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{company.slug}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {company.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {company.email && (
                <p className="text-sm text-gray-600 mb-1">📧 {company.email}</p>
              )}
              {company.phone && (
                <p className="text-sm text-gray-600 mb-1">📞 {company.phone}</p>
              )}
              {company.cui && (
                <p className="text-sm text-gray-600 mb-1">🏢 CUI: {company.cui}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleOpenSettingsModal(company)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => handleEdit(company)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleActive(company.id, company.is_active)}
                  className={`px-3 py-2 rounded-lg font-bold transition ${
                    company.is_active
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {company.is_active ? '🚫' : '✅'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <h3 className="text-lg font-black mb-4 text-gray-900">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Restaurant ABC"
                      disabled={!!editingCompany}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="+40 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">CUI (Tax ID)</label>
                    <input
                      type="text"
                      value={formData.cui}
                      onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="RO12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Street address, city"
                    />
                  </div>
                </div>
              </div>

              {/* Calculator Settings - Only for NEW companies */}
              {!editingCompany && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-black mb-2 text-blue-900">⚙️ Calculator Settings</h3>
                    <p className="text-sm text-blue-700 mb-4">Configure default calculation values for this company</p>
                  </div>

                  {/* General Settings */}
                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <h4 className="font-black text-green-900 mb-3">📊 General Settings</h4>
                    <div className="space-y-3">
                      {generalSettings.map((setting, idx) => (
                        <div key={setting.setting_key} className="bg-white rounded-lg p-3">
                          <label className="block text-sm font-bold mb-1">{setting.label}</label>
                          <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                          <input
                            type="number"
                            step="0.01"
                            value={setting.value_number}
                            onChange={(e) => {
                              const updated = [...settingsFormData];
                              const index = settingsFormData.findIndex(s => s.setting_key === setting.setting_key);
                              updated[index].value_number = parseFloat(e.target.value) || 0;
                              setSettingsFormData(updated);
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Online Settings */}
                  <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                    <h4 className="font-black text-purple-900 mb-3">🌐 Online Delivery Settings</h4>
                    <div className="space-y-3">
                      {onlineSettings.map((setting) => (
                        <div key={setting.setting_key} className="bg-white rounded-lg p-3">
                          <label className="block text-sm font-bold mb-1">{setting.label}</label>
                          <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                          <input
                            type="number"
                            step="0.01"
                            value={setting.value_number}
                            onChange={(e) => {
                              const updated = [...settingsFormData];
                              const index = settingsFormData.findIndex(s => s.setting_key === setting.setting_key);
                              updated[index].value_number = parseFloat(e.target.value) || 0;
                              setSettingsFormData(updated);
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catering Settings */}
                  <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                    <h4 className="font-black text-orange-900 mb-3">🍱 Catering Settings</h4>
                    <div className="space-y-3">
                      {cateringSettings.map((setting) => (
                        <div key={setting.setting_key} className="bg-white rounded-lg p-3">
                          <label className="block text-sm font-bold mb-1">{setting.label}</label>
                          <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                          <input
                            type="number"
                            step="0.01"
                            value={setting.value_number}
                            onChange={(e) => {
                              const updated = [...settingsFormData];
                              const index = settingsFormData.findIndex(s => s.setting_key === setting.setting_key);
                              updated[index].value_number = parseFloat(e.target.value) || 0;
                              setSettingsFormData(updated);
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingCompany ? '💾 Update Company' : '➕ Create Company & Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal for Existing Companies */}
      {isSettingsModalOpen && selectedCompanyForSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-4">
              ⚙️ Calculator Settings: {selectedCompanyForSettings.company_name}
            </h2>

            <div className="space-y-4">
              {/* General Settings */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <h4 className="font-black text-green-900 mb-3">📊 General Settings</h4>
                <div className="space-y-3">
                  {companySettings.filter(s => s.setting_category === 'general').map((setting, idx) => (
                    <div key={setting.id || idx} className="bg-white rounded-lg p-3">
                      <label className="block text-sm font-bold mb-1">{setting.label}</label>
                      <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                      <input
                        type="number"
                        step="0.01"
                        value={setting.value_number}
                        onChange={(e) => updateSettingValue(
                          companySettings.indexOf(setting),
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Online Settings */}
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <h4 className="font-black text-purple-900 mb-3">🌐 Online Delivery Settings</h4>
                <div className="space-y-3">
                  {companySettings.filter(s => s.setting_category === 'online').map((setting, idx) => (
                    <div key={setting.id || idx} className="bg-white rounded-lg p-3">
                      <label className="block text-sm font-bold mb-1">{setting.label}</label>
                      <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                      <input
                        type="number"
                        step="0.01"
                        value={setting.value_number}
                        onChange={(e) => updateSettingValue(
                          companySettings.indexOf(setting),
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Catering Settings */}
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <h4 className="font-black text-orange-900 mb-3">🍱 Catering Settings</h4>
                <div className="space-y-3">
                  {companySettings.filter(s => s.setting_category === 'catering').map((setting, idx) => (
                    <div key={setting.id || idx} className="bg-white rounded-lg p-3">
                      <label className="block text-sm font-bold mb-1">{setting.label}</label>
                      <p className="text-xs text-gray-600 mb-2">{setting.description}</p>
                      <input
                        type="number"
                        step="0.01"
                        value={setting.value_number}
                        onChange={(e) => updateSettingValue(
                          companySettings.indexOf(setting),
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                💾 Save Settings
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}