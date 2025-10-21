'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Building2, Users, Package, Tag, Settings, Crown, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          router.push('/dashboard');
          return;
        }

        if (profile?.role !== 'admin') {
          console.log('User is not admin, redirecting');
          router.push('/dashboard');
          return;
        }

        console.log('User is admin! Showing admin panel');
        setIsAdmin(true);
      } catch (error) {
        console.error('Error in admin check:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Navigation items with active state
  const navItems = [
    {
      href: '/dashboard/admin',
      label: 'Dashboard',
      Icon: Home,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/dashboard/admin/companies',
      label: 'Companies',
      Icon: Building2,
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/dashboard/admin/users',
      label: 'Users',
      Icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/dashboard/admin/products',
      label: 'Products',
      Icon: Package,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/dashboard/admin/categories',
      label: 'Categories',
      Icon: Tag,
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/dashboard/admin/settings',
      label: 'Settings',
      Icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-semibold transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Admin Panel
              </h1>
            </div>

            {/* Right side - Navigation links */}
            <div className="flex gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-bold transition shadow-md flex items-center gap-2 ${
                      isActive
                        ? `${item.color} text-white ring-2 ring-offset-2 ring-blue-500`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <item.Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}