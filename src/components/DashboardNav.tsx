'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) return null;

  return (
    <nav className="bg-white border-b-4 border-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black">Z</div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest">ZED</span>
              <span className="text-xs font-black tracking-widest">ZEN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-[#BBDCFF] border-2 border-black rounded-lg font-bold text-black hover:scale-105 transition-transform"
            >
              📊 Calculator
            </button>

            {isAdmin && (
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="px-4 py-2 bg-red-500 border-2 border-black rounded-lg font-bold text-white hover:scale-105 transition-transform"
              >
                🔐 Admin
              </button>
            )}

            {/* User Info */}
            <div className="px-4 py-2 bg-[#9eff55] border-2 border-black rounded-lg">
              <div className="text-xs font-bold">USER</div>
              <div className="text-sm font-black">{user?.email?.split('@')[0]}</div>
            </div>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}