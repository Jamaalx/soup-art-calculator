'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('🔍 Admin Check - User:', user?.email);
        console.log('🔍 Admin Check - User Error:', userError);
        
        if (userError || !user) {
          console.log('❌ No user found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('🔍 Fetching profile for user ID:', user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('🔍 Profile data:', profile);
        console.log('🔍 Profile error:', profileError);

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          router.push('/dashboard');
          return;
        }

        console.log('🔍 User role:', profile?.role);

        if (profile?.role !== 'admin') {
          console.log('❌ User is not admin, redirecting. Role is:', profile?.role);
          router.push('/dashboard');
          return;
        }

        console.log('✅ User is admin! Showing admin panel');
        setIsAdmin(true);
      } catch (error) {
        console.error('❌ Error in admin check:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-semibold transition flex items-center gap-2"
              >
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-black text-gray-900">👑 Admin Panel</h1>
            </div>
            <div className="flex gap-3">
  <Link
    href="/dashboard/admin/products"
    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
  >
    📦 Products
  </Link>
  <Link
    href="/dashboard/admin/categories"
    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-md"
  >
    📁 Categories
  </Link>
  <Link
    href="/dashboard/admin/users"
    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
  >
    👥 Users
  </Link>
  <Link
    href="/dashboard/admin/settings"
    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
  >
    ⚙️ Settings
  </Link>
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