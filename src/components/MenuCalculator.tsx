'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import DashboardProduse from './DashboardProduse';
import MeniuFixBuilder from './MenuFixBuilder';
import MeniuVariatiiBuilder from './MeniuVariatiiBuilder';

type ViewMode = 'dashboard' | 'fix' | 'variatii';

const MenuOnlineCalculator = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  
  // Fetch products from Supabase (respects RLS - only user's products)
  const { products, loading, error } = useProducts();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            <p className="text-xl font-black text-black">Se încarcă produsele...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="bg-red-100 rounded-3xl shadow-2xl p-8 border-4 border-black max-w-lg">
          <h2 className="text-2xl font-black text-black mb-4">⚠️ EROARE</h2>
          <p className="text-sm font-bold text-black mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
          >
            🔄 REÎNCEARCĂ
          </button>
        </div>
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="bg-yellow-100 rounded-3xl shadow-2xl p-8 border-4 border-black max-w-lg text-center">
          <h2 className="text-2xl font-black text-black mb-4">📦 FĂRĂ PRODUSE</h2>
          <p className="text-sm font-bold text-black mb-6">
            Nu ai produse adăugate în baza de date. Adaugă produse din panoul de administrare.
          </p>
          <a
            href="/dashboard/products"
            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
          >
            ➕ ADAUGĂ PRODUSE
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-[#9eff55] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
                📦 CALCULATOR ONLINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
                MENIU LIVRARE
              </h1>
              <p className="text-gray-700 font-semibold">
                Pricing pentru comenzi online cu livrare • {products.length} produse
              </p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white border-4 border-black">
              <p className="text-xs font-bold opacity-90">CALCULATOR</p>
              <p className="text-xl font-black">ONLINE</p>
            </div>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-4 border-black">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
                activeView === 'dashboard'
                  ? 'bg-[#9eff55] text-black scale-105'
                  : 'bg-white text-black hover:bg-green-100'
              }`}
            >
              📊 DASHBOARD
            </button>
            
            <button
              onClick={() => setActiveView('fix')}
              className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
                activeView === 'fix'
                  ? 'bg-[#9eff55] text-black scale-105'
                  : 'bg-white text-black hover:bg-green-100'
              }`}
            >
              🔒 MENIU FIX
            </button>
            
            <button
              onClick={() => setActiveView('variatii')}
              className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
                activeView === 'variatii'
                  ? 'bg-[#9eff55] text-black scale-105'
                  : 'bg-white text-black hover:bg-green-100'
              }`}
            >
              🎨 MENIU VARIAȚII
            </button>
          </div>
        </div>

        {/* Content Area - Pass database products to child components */}
        <div>
          {activeView === 'dashboard' && (
            <DashboardProduse products={products} calculatorType="online" />
          )}
          
          {activeView === 'fix' && (
            <MeniuFixBuilder products={products} calculatorType="online" />
          )}
          
          {activeView === 'variatii' && (
            <MeniuVariatiiBuilder products={products} calculatorType="online" />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 bg-black rounded-3xl shadow-2xl p-6 text-white border-4 border-black">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-white mb-1">
                Calculator dezvoltat pentru <strong className="text-[#9eff55]">CLIENTII ZED-ZEN</strong>
              </p>
              <p className="text-sm text-gray-400">© 2025 | Date live din baza de date</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Produse încărcate</p>
              <p className="text-2xl font-black text-[#9eff55]">{products.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOnlineCalculator;