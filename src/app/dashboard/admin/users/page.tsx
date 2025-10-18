'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// ✅ Updated interface to match database schema exactly
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name?: string | null;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'user' | 'admin',
    company_id: '' as string
  });

  const [companies, setCompanies] = useState<Array<{id: string; company_name: string}>>([]);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role === 'admin') {
        setCurrentUserRole('admin');
        fetchCompanies();
        fetchUsers();
      } else {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/dashboard';
      }
    } else {
      alert('Please log in');
      window.location.href = '/login';
    }
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name')
      .eq('is_active', true)
      .order('company_name');
    
    if (!error && data) {
      setCompanies(data);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // ✅ Use the admin API route to fetch users
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('✅ Loaded users:', data.users?.length);
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      alert('Error loading users: ' + error.message);
    }
    
    setLoading(false);
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
      // ✅ Call the admin users API route
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || null,
          role: formData.role,
          company_id: formData.company_id || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      alert('✅ User created successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchUsers();

    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
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
      role: 'user',
      company_id: ''
    });
  };

  // ✅ Safe filtering with null handling
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length
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
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Users Management</h1>
            <p className="text-gray-600">Manage user roles, permissions, and access</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
          >
            ➕ Create User
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👥</span>
            <span className="text-3xl font-black text-blue-600">{stats.total}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👑</span>
            <span className="text-3xl font-black text-purple-600">{stats.admins}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Admins</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">✅</span>
            <span className="text-3xl font-black text-green-600">{stats.active}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Active</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">❌</span>
            <span className="text-3xl font-black text-red-600">{stats.inactive}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Inactive</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-gray-200">
        <input
          type="text"
          placeholder="🔍 Search users by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-lg font-bold">No users found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm ? 'Try a different search term' : 'Click "Create User" to add your first user'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 transition ${
                      user.id === currentUserId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {user.full_name || 'Unnamed User'}
                            {user.id === currentUserId && (
                              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.company_name && (
                            <p className="text-xs text-blue-600 font-semibold">
                              🏢 {user.company_name}
                            </p>
                          )}
                          {user.last_sign_in_at && (
                            <p className="text-xs text-gray-400">
                              Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
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
                      <p className="text-sm text-gray-700">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={user.id === currentUserId}
                          className={`px-3 py-2 rounded-lg font-bold text-xs transition ${
                            user.is_active
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          } ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUserId}
                          className={`px-3 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 transition ${
                            user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          🗑️ Delete
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

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">ℹ️</span>
          <div>
            <h3 className="font-black text-blue-900 mb-2">User Management Notes</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• <strong>Admins</strong> can access the admin panel and manage products, categories, and users</li>
              <li>• <strong>Regular users</strong> can only access the calculator and their own data</li>
              <li>• <strong>Inactive users</strong> cannot log in to the system</li>
              <li>• You cannot change your own role or deactivate yourself</li>
              <li>• <strong>Deleting a user</strong> is permanent and cannot be undone</li>
              <li>• Each user has isolated data (products, categories, calculations)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
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
                <label className="block text-sm font-bold mb-2">Company</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No company (Independent user)</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">User will inherit company products and categories</p>
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

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Note:</strong> Email will be auto-confirmed. If company is selected, user will automatically receive all company products and categories.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
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