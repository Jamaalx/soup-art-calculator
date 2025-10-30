'use client';

import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  Package, 
  Database, 
  Settings, 
  BarChart3, 
  FileText,
  Building,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Tags,
  ChefHat,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';

const getAdminSections = (t: any) => [
  {
    title: t('user-management') || 'User Management',
    description: t('user-management-desc') || 'Manage user accounts, permissions, and company assignments',
    icon: Users,
    href: '/dashboard/admin/users',
    gradient: 'from-blue-600 to-indigo-600',
    status: 'Active',
  },
  {
    title: t('products-ingredients') || 'Products & Ingredients',
    description: t('products-ingredients-desc') || 'Global product catalog and ingredient database management',
    icon: Package,
    href: '/dashboard/admin/products',
    gradient: 'from-green-600 to-emerald-600',
    status: 'Active',
  },
  {
    title: t('categories-management') || 'Categories',
    description: t('categories-management-desc') || 'Manage product categories and classifications',
    icon: Tags,
    href: '/dashboard/admin/categories',
    gradient: 'from-purple-600 to-pink-600',
    status: 'Active',
  },
  {
    title: t('companies-management') || 'Companies',
    description: t('companies-management-desc') || 'Manage restaurant companies and their settings',
    icon: Building,
    href: '/dashboard/admin/companies',
    gradient: 'from-yellow-600 to-orange-600',
    status: 'Active',
  },
  {
    title: t('delivery-platforms') || 'Delivery Platforms',
    description: t('delivery-platforms-desc') || 'Manage delivery platforms and commission rates per company',
    icon: Truck,
    href: '/dashboard/admin/platforms',
    gradient: 'from-blue-500 to-cyan-500',
    status: 'Active',
  },
  {
    title: t('recipes-management') || 'Recipe Templates',
    description: t('recipes-management-desc') || 'Manage global recipe templates and standards',
    icon: ChefHat,
    href: '/dashboard/foodcost',
    gradient: 'from-cyan-600 to-blue-600',
    status: 'Active',
  },
  {
    title: t('system-configuration') || 'System Configuration',
    description: t('system-configuration-desc') || 'Platform settings, feature flags, and global configurations',
    icon: Settings,
    href: '/dashboard/settings',
    gradient: 'from-gray-600 to-slate-600',
    status: 'Active',
  },
];

interface Stats {
  totalCompanies: number;
  activeUsers: number;
  totalProducts: number;
  totalIngredients: number;
  systemHealth: string;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const adminSections = getAdminSections(t);
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalIngredients: 0,
    systemHealth: '100%'
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all stats in parallel
        const [companiesResult, usersResult, productsResult, ingredientsResult] = await Promise.all([
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('is_active', true)
        ]);

        setStats({
          totalCompanies: companiesResult.count || 0,
          activeUsers: usersResult.count || 0,
          totalProducts: productsResult.count || 0,
          totalIngredients: ingredientsResult.count || 0,
          systemHealth: '100%'
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const quickStats = [
    {
      label: 'Total Companies',
      value: loading ? '...' : stats.totalCompanies.toString(),
      icon: Building,
      change: '+0%',
      positive: true,
    },
    {
      label: 'Active Users',
      value: loading ? '...' : stats.activeUsers.toString(),
      icon: Users,
      change: '+0%',
      positive: true,
    },
    {
      label: 'Total Products',
      value: loading ? '...' : `${stats.totalProducts}`,
      icon: Package,
      change: `${stats.totalIngredients} ingredients`,
      positive: true,
    },
    {
      label: 'System Health',
      value: stats.systemHealth,
      icon: TrendingUp,
      change: 'Optimal',
      positive: true,
    },
  ];

  const recentActivity = [
    {
      type: 'system',
      message: 'Admin panel initialized',
      time: 'Just now',
      icon: Shield,
    },
    {
      type: 'info',
      message: 'System ready for configuration',
      time: 'Just now',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-bold">ADMIN PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">{t('system-administration') || 'System Administration'}</h1>
            <p className="text-red-100 text-sm sm:text-base">
              {t('admin-panel-desc') || 'Comprehensive platform management and oversight tools'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-black">ZEDZEN</div>
            <div className="text-xs sm:text-sm opacity-90">HoReCa Finance Suite</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {quickStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <span className={`text-xs sm:text-sm font-bold ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <div className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-red-300 hover:shadow-xl transition-all cursor-pointer h-full">
                <div className={`bg-gradient-to-r ${section.gradient} p-4 sm:p-5 lg:p-6 rounded-t-xl`}>
                  <div className="flex items-center justify-between text-white">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {section.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 lg:p-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('recent-activity') || 'Recent Activity'}
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('system-status') || 'System Status'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-900">All Systems Operational</p>
                <p className="text-xs text-green-600">Last checked: Just now</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Database Connected</p>
                <p className="text-xs text-blue-600">Response time: &lt;50ms</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Authentication Active</p>
                <p className="text-xs text-purple-600">Supabase RLS enforced</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4">{t('quick-admin-actions') || 'Quick Administrative Actions'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="bg-blue-100 rounded-lg p-2">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Database Backup</p>
              <p className="text-sm text-gray-600">Create system backup</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
            <div className="bg-green-100 rounded-lg p-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-600">System usage analytics</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
            <div className="bg-purple-100 rounded-lg p-2">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">System Maintenance</p>
              <p className="text-sm text-gray-600">Platform optimization</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}