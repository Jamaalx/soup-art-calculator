'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProductsProvider } from '../../contexts/ProductsContext';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="text-center">
          <div className="text-4xl font-black mb-4">⏳</div>
          <div className="text-2xl font-black">SE ÎNCARCĂ...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <ProductsProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Montserrat', sans-serif;
          }
        `}</style>

        {/* Top Navigation Bar */}
        <div className="bg-black border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border-2 border-white">
                  <span className="text-xl font-black text-black">MENU CALCULATOR</span>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-xl border-2 border-white">
                  <p className="text-xs font-bold text-gray-600">UTILIZATOR</p>
                  <p className="text-sm font-black text-black">{user.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-[#9eff55] hover:bg-[#8ee945] text-black font-black px-6 py-2 rounded-xl border-2 border-white transition-all hover:scale-105"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </ProductsProvider>
  );
}