'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, [user]);

  const checkAdminAndFetchUsers = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert('❌ Access Denied: Admin only!');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Fetch all users
      const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      alert(`✅ User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      checkAdminAndFetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('❌ Error updating user status');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      alert(`✅ User role updated to ${newRole.toUpperCase()}!`);
      checkAdminAndFetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('❌ Error updating user role');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-black">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-2xl font-black text-black">Loading Admin Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold mb-3 border-2 border-black">
                🔐 ADMIN ONLY
              </span>
              <h1 className="text-4xl font-black text-black mb-2">ADMIN DASHBOARD</h1>
              <div className="text-gray-700 font-semibold">Manage all users and their access</div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '👥', label: 'TOTAL USERS', value: users.length, color: '#BBDCFF' },
            { icon: '✅', label: 'ACTIVE', value: users.filter(u => u.is_active).length, color: '#9eff55' },
            { icon: '⛔', label: 'INACTIVE', value: users.filter(u => !u.is_active).length, color: '#FFB6C1' },
            { icon: '🔑', label: 'ADMINS', value: users.filter(u => u.role === 'admin').length, color: '#FFC857' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border-4 border-black" style={{backgroundColor: stat.color}}>
              <div className="flex justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className="text-3xl font-black text-black">{stat.value}</div>
              </div>
              <div className="text-sm font-black text-black">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h2 className="text-2xl font-black mb-6 text-black">👥 ALL USERS ({users.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-black">
                  <th className="text-left p-4 font-black text-black">Email</th>
                  <th className="text-left p-4 font-black text-black">Company</th>
                  <th className="text-left p-4 font-black text-black">Role</th>
                  <th className="text-left p-4 font-black text-black">Status</th>
                  <th className="text-left p-4 font-black text-black">Created</th>
                  <th className="text-left p-4 font-black text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-bold text-black">{u.email}</td>
                    <td className="p-4 text-black">{u.company_name || '-'}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          if (confirm(`Change ${u.email} to ${e.target.value.toUpperCase()}?`)) {
                            updateUserRole(u.id, e.target.value as 'admin' | 'user');
                          }
                        }}
                        className="px-3 py-1 border-2 border-black rounded-lg font-bold bg-white text-black"
                        disabled={u.id === user?.id}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-bold border-2 border-black ${
                        u.is_active 
                          ? 'bg-[#9eff55] text-black' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {u.is_active ? '✅ ACTIVE' : '⛔ INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-black">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          if (confirm(`${u.is_active ? 'Deactivate' : 'Activate'} ${u.email}?`)) {
                            toggleUserStatus(u.id, u.is_active);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
                          u.is_active 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-[#9eff55] text-black hover:bg-[#8ee544]'
                        }`}
                        disabled={u.id === user?.id}
                      >
                        {u.is_active ? '⛔ DEACTIVATE' : '✅ ACTIVATE'}
                      </button>
                      {u.id === user?.id && (
                        <div className="text-xs text-gray-500 mt-1">Cannot modify yourself</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-xl font-black text-black">No users found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}