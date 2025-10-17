'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  // Don't show landing page if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="text-8xl font-black">Z</div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-widest">ZED</span>
              <span className="text-2xl font-black tracking-widest">ZEN</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tight">
            MENU CALCULATOR
          </h1>
          <div className="text-2xl md:text-3xl font-bold text-gray-700 mb-12">
            Optimizează prețurile meniurilor tale
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {[
              {
                icon: '📊',
                title: 'ANALIZĂ COMPLETĂ',
                description: 'Vezi toate combinațiile posibile și profitabilitatea lor'
              },
              {
                icon: '💰',
                title: 'PROFIT OPTIMIZAT',
                description: 'Calculează marje și recomandări de preț automat'
              },
              {
                icon: '🔐',
                title: 'MULTI-USER',
                description: 'Fiecare utilizator își gestionează propriile produse'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-black hover:scale-105 transition-transform"
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <div className="text-xl font-black text-black mb-2">{feature.title}</div>
                <div className="text-sm text-gray-700 font-semibold">{feature.description}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-black text-white rounded-2xl font-black text-xl border-4 border-black hover:scale-105 transition-transform shadow-xl"
            >
              🚪 LOGIN
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-[#9eff55] text-black rounded-2xl font-black text-xl border-4 border-black hover:scale-105 transition-transform shadow-xl"
            >
              ✨ REGISTER
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-4 border-black shadow-2xl">
              <div className="text-lg font-bold text-gray-800 mb-4">
                📋 Calculator profesional pentru restaurante
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Gestionează-ți produsele, calculează prețuri optime și generează oferte pentru clienți.
                Sistem multi-user cu acces securizat și date izolate per utilizator.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-6 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="font-bold">
              Powered by <span className="text-[#9eff55]">ZED-ZEN</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 | www.zed-zen.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}