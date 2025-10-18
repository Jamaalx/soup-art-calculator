'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_id: string | null;
  company_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  company_name: string;
  slug: string;
  is_active: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    company_id: ''
  });

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role === 'admin') {
        setCurrentUserRole('admin');
        await fetchCompanies();
        await fetchUsers();
      } else {
        alert('Access denied. Admin privileges required.');
        router.push('/dashboard');
      }
    } else {
      alert('Please log in');
      router.push('/login');
    }
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('company_name');
    
    if (!error && data) {
      setCompanies(data);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users: ' + error.message);
    } else {
      console.log('✅ Loaded users:', data?.length);
      setUsers(data || []);
    }
    
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('Email and password are required!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          role: formData.role,
          company_id: formData.company_id || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      alert('✅ User created successfully! ' + 
            (formData.company_id ? 'Templates will be assigned automatically.' : 'No templates assigned.'));
      setIsModalOpen(false);
      resetForm();
      fetchUsers();

    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
    }
  };

  const handleUpdateCompany = async (userId: string, newCompanyId: string | null) => {
    if (userId === currentUserId) {
      alert('You cannot change your own company!');
      return;
    }

    const confirmMessage = newCompanyId
      ? 'Are you sure you want to change this user\'s company? This will NOT affect their existing data.'
      : 'Are you sure you want to remove this user from their company?';

    if (!confirm(confirmMessage)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        company_id: newCompanyId,
        company_name: newCompanyId ? companies.find(c => c.id === newCompanyId)?.company_name : null
      })
      .eq('id', userId);

    if (error) {
      alert('Error updating company: ' + error.message);
    } else {
      alert('✅ User company updated!');
      fetchUsers();
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      alert('You cannot change your own role!');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = newRole === 'admin' 
      ? 'Are you sure you want to make this user an admin?' 
      : 'Are you sure you want to remove admin privileges?';

    if (!confirm(confirmMessage)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Error updating role: ' + error.message);
    } else {
      alert(`✅ User role updated to ${newRole}!`);
      fetchUsers();
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserId) {
      alert('You cannot deactivate yourself!');
      return;
    }

    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? 'Are you sure you want to activate this user?' 
      : 'Are you sure you want to deactivate this user?';

    if (!confirm(confirmMessage)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      alert(`✅ User ${newStatus ? 'activated' : 'deactivated'}!`);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      alert('You cannot delete yourself!');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      alert('✅ User deleted successfully!');
      fetchUsers();

    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'user',
      company_id: ''
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCompany = selectedCompanyFilter === 'all' ||
      (selectedCompanyFilter === 'none' && !user.company_id) ||
      user.company_id === selectedCompanyFilter;
    
    return matchesSearch && matchesCompany;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
    withCompany: users.filter(u => u.company_id).length,
    noCompany: users.filter(u => !u.company_id).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">ADMIN</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">USER MANAGEMENT</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Users Management</h1>
            <p className="text-white/90">Manage users, roles, and company assignments</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition"
          >
            ➕ Create User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow-md border-2 border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Admins</p>
          <p className="text-3xl font-black text-purple-700">{stats.admins}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-black text-green-700">{stats.active}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-md border-2 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">With Company</p>
          <p className="text-3xl font-black text-blue-700">{stats.withCompany}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 shadow-md border-2 border-orange-200">
          <p className="text-sm text-orange-700 mb-1">No Company</p>
          <p className="text-3xl font-black text-orange-700">{stats.noCompany}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
          />
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
          >
            <option value="all">All Companies</option>
            <option value="none">No Company</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-lg font-bold">No users found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm || selectedCompanyFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Click "Create User" to add your first user'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 transition ${
                      user.id === currentUserId ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {user.full_name || 'Unnamed User'}
                            {user.id === currentUserId && (
                              <span className="ml-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-400">📱 {user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.company_id || ''}
                        onChange={(e) => handleUpdateCompany(user.id, e.target.value || null)}
                        disabled={user.id === currentUserId}
                        className={`px-3 py-2 border-2 rounded-lg text-sm font-bold focus:border-blue-500 focus:outline-none ${
                          user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          user.company_id 
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <option value="">No Company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            🏢 {company.company_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        disabled={user.id === currentUserId}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/admin/users/assign?user=${user.id}`)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg font-bold text-xs hover:bg-blue-600 transition"
                        >
                          📦 Assign
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={user.id === currentUserId}
                          className={`px-3 py-2 rounded-lg font-bold text-xs transition ${
                            user.is_active
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          } ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUserId}
                          className={`px-3 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 transition ${
                            user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-black text-blue-900 mb-2">How Company Assignment Works</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Users <strong>with a company</strong> can access company product/category templates</li>
              <li>• Users <strong>without a company</strong> start with empty data and create their own</li>
              <li>• Click <strong>"Assign"</strong> button to copy templates to a specific user</li>
              <li>• Changing a user's company does NOT affect their existing data</li>
              <li>• Each user has isolated data regardless of company membership</li>
              <li>• Admins can manage templates for all companies</li>
            </ul>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-black mb-6">Create New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Min 6 characters"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John Doe (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="+40 123 456 789 (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Company</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No company (User creates own data)</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      🏢 {company.company_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.company_id 
                    ? 'Templates can be assigned later via "Assign" button' 
                    : 'User will start with empty products/categories'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">👤 User</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-indigo-800">
                  💡 Email will be auto-confirmed. After creation, use the "Assign" button to copy company templates to this user.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  ➕ Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
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
    </div>
  );
}