'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calculator, Shield, LogOut } from 'lucide-react';

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
    <nav className="bg-white border-b-4 border-black shadow-lg mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-black">Z</div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest text-black">ZED</span>
              <span className="text-sm font-black tracking-widest text-black">ZEN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-[#BBDCFF] border-2 border-black rounded-xl font-bold text-black hover:scale-105 transition-transform shadow-md flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="px-5 py-2.5 bg-red-500 border-2 border-black rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-md flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            {/* User Info */}
            <div className="px-5 py-2.5 bg-[#9eff55] border-2 border-black rounded-xl shadow-md">
              <div className="text-xs font-bold text-black">USER</div>
              <div className="text-sm font-black text-black truncate max-w-[150px]">
                {user?.email?.split('@')[0] || 'user'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-red-600 text-white border-2 border-black rounded-xl font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}