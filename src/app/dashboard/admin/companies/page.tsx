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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    cui: ''
  });

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
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('company_name');

      console.log('📊 Fetching companies...');
      console.log('✅ Companies data:', data);
      console.log('❌ Companies error:', error);

      if (error) {
        console.error('Error fetching companies:', error);
        alert('Error loading companies: ' + error.message);
      } else {
        console.log(`✅ Loaded ${data?.length || 0} companies`);
        setCompanies(data || []);
      }
    } catch (error: any) {
      console.error('❌ Exception fetching companies:', error);
      alert('Error loading companies: ' + error.message);
    }
    
    setLoading(false);
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
    } else {
      const { error } = await supabase
        .from('companies')
        .insert({
          company_name: formData.company_name,
          slug: slug,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          cui: formData.cui || null,
          is_active: true
        });

      if (error) {
        alert('Error creating company: ' + error.message);
        return;
      }
      alert('✅ Company created successfully!');
    }

    setIsModalOpen(false);
    resetForm();
    fetchCompanies();
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
  };

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Companies Management</h1>
            <p className="text-gray-600">Manage companies and their data</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
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
                  onClick={() => handleEdit(company)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleActive(company.id, company.is_active)}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold transition ${
                    company.is_active
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {company.is_active ? '🚫 Deactivate' : '✅ Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black mb-6">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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
                  rows={3}
                  placeholder="Street address, city, country"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingCompany ? '💾 Update' : '➕ Create'}
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
    </div>
  );
}