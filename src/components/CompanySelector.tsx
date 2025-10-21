'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Company {
  id: string;
  company_name: string;
  owner_user_id: string | null;
  is_active: boolean;
}

interface CompanySelectorProps {
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string | null) => void;
}

export default function CompanySelector({ selectedCompanyId, onCompanyChange }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, owner_user_id, is_active')
      .eq('is_active', true)
      .order('company_name');

    if (error) {
      console.error('Error fetching companies:', error);
      alert('Error loading companies: ' + error.message);
    } else {
      setCompanies(data || []);
      // Auto-select first company if none selected
      if (!selectedCompanyId && data && data.length > 0) {
        onCompanyChange(data[0].id);
      }
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompanyName.trim()) {
      alert('Company name is required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in');
      return;
    }

    // Generate slug from company name
    const slug = newCompanyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabase
      .from('companies')
      .insert({
        company_name: newCompanyName,
        slug: slug,
        owner_user_id: user.id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      alert('Error creating company: ' + error.message);
      return;
    }

    alert('Company created successfully!');
    setIsModalOpen(false);
    setNewCompanyName('');
    fetchCompanies();
    if (data) {
      onCompanyChange(data.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Company
            </label>
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => onCompanyChange(e.target.value || null)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
            >
              <option value="">-- Select a company --</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md whitespace-nowrap"
            >
              ➕ New Company
            </button>
          </div>
        </div>

        {selectedCompany && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedCompany.company_name}
            </p>
          </div>
        )}

        {!selectedCompanyId && companies.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Please select a company to manage its data
            </p>
          </div>
        )}

        {companies.length === 0 && (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              No companies found. Create your first company to get started!
            </p>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black mb-6">Create New Company</h2>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Restaurant ABC"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Each company has isolated products, categories, and settings.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                >
                  ➕ Create Company
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewCompanyName('');
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}