'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
  recentActivity: {
    newUsersToday: number;
    newProductsToday: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    activeCategories: 0,
    recentActivity: {
      newUsersToday: 0,
      newProductsToday: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    initializeAdmin();
  }, []);

  const initializeAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in');
      router.push('/login');
      return;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    setCurrentUser({ ...user, ...profile });
    fetchStats();
  };

  const fetchStats = async () => {
    setLoading(true);

    try {
      // Fetch users stats from profiles
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, role, is_active, created_at');

      if (usersError) throw usersError;

      // Fetch products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_active, created_at');

      if (productsError) throw productsError;

      // Fetch categories stats
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, is_active, created_at');

      if (categoriesError) throw categoriesError;

      // Calculate today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        totalUsers: users?.length || 0,
        activeUsers: users?.filter(u => u.is_active).length || 0,
        adminUsers: users?.filter(u => u.role === 'admin').length || 0,
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.is_active).length || 0,
        totalCategories: categories?.length || 0,
        activeCategories: categories?.filter(c => c.is_active).length || 0,
        recentActivity: {
          newUsersToday: users?.filter(u => new Date(u.created_at) >= today).length || 0,
          newProductsToday: products?.filter(p => new Date(p.created_at) >= today).length || 0
        }
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      alert('Error loading statistics: ' + error.message);
    }

    setLoading(false);
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Create, edit, and manage user accounts',
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      href: '/dashboard/admin/users',
      stats: `${stats.totalUsers} total • ${stats.activeUsers} active`
    },
    {
      title: 'Manage Products',
      description: 'Add and edit products with pricing',
      icon: '📦',
      color: 'from-green-500 to-green-600',
      href: '/dashboard/admin/products',
      stats: `${stats.totalProducts} total • ${stats.activeProducts} active`
    },
    {
      title: 'Manage Categories',
      description: 'Organize products into categories',
      icon: '🏷️',
      color: 'from-purple-500 to-purple-600',
      href: '/dashboard/admin/categories',
      stats: `${stats.totalCategories} total • ${stats.activeCategories} active`
    },
    {
      title: 'Back to Dashboard',
      description: 'Return to main calculator dashboard',
      icon: '🏠',
      color: 'from-gray-500 to-gray-600',
      href: '/dashboard',
      stats: 'User dashboard'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-blue-100 text-lg">
              {currentUser?.full_name || currentUser?.email || 'Administrator'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Here's what's happening with your platform today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-3xl font-black text-blue-600">{stats.totalUsers}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-700 mb-1">Total Users</h3>
          <p className="text-xs text-gray-500">
            {stats.activeUsers} active • {stats.adminUsers} admins
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <span className="text-3xl font-black text-green-600">{stats.totalProducts}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-700 mb-1">Total Products</h3>
          <p className="text-xs text-gray-500">
            {stats.activeProducts} active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
            <span className="text-3xl font-black text-purple-600">{stats.totalCategories}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-700 mb-1">Categories</h3>
          <p className="text-xs text-gray-500">
            {stats.activeCategories} active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <span className="text-3xl font-black text-orange-600">
              {stats.recentActivity.newUsersToday}
            </span>
          </div>
          <h3 className="text-sm font-bold text-gray-700 mb-1">New Today</h3>
          <p className="text-xs text-gray-500">
            {stats.recentActivity.newProductsToday} products added
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.href)}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-2xl hover:scale-105 transition-all group text-left"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{action.icon}</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{action.stats}</span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span> System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </div>
                <div>
                  <p className="font-bold text-gray-900">User Activation Rate</p>
                  <p className="text-xs text-gray-500">{stats.activeUsers} of {stats.totalUsers} users active</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-black">
                  {stats.activeProducts}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Active Products</p>
                  <p className="text-xs text-gray-500">{stats.totalProducts} total products</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-black">
                  {stats.activeCategories}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Active Categories</p>
                  <p className="text-xs text-gray-500">{stats.totalCategories} total categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tips */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border-2 border-yellow-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span> Admin Tips
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="font-bold text-gray-900 mb-1">Multi-Tenant System</p>
              <p className="text-sm text-gray-600">Each user has isolated data. Products and categories are user-specific.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="font-bold text-gray-900 mb-1">User Management</p>
              <p className="text-sm text-gray-600">Create users with auto-confirmed emails. No verification required.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <p className="font-bold text-gray-900 mb-1">Data Security</p>
              <p className="text-sm text-gray-600">RLS policies ensure users can only access their own data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 rounded-xl p-6 text-center border-2 border-gray-200">
        <p className="text-gray-600 text-sm mb-2">
          <strong>Admin Panel</strong> • Menu Calculator Pro • Multi-Tenant System
        </p>
        <p className="text-gray-500 text-xs">
          All data loaded from database in real-time
        </p>
      </div>
    </div>
  );
}