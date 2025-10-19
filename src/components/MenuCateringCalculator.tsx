'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import DashboardProduse from './DashboardProduse';
import OfferGenerator from './OfferGenerator';

type ViewMode = 'dashboard' | 'offer';

const MenuCateringCalculator = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  
  // Fetch products from Supabase (respects RLS)
  const { products, loading, error } = useProducts();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-orange-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="text-xl font-black text-black">Se încarcă produsele...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-orange-100">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-orange-100">
        <div className="bg-yellow-100 rounded-3xl shadow-2xl p-8 border-4 border-black max-w-lg text-center">
          <h2 className="text-2xl font-black text-black mb-4">📦 FĂRĂ PRODUSE</h2>
          <p className="text-sm font-bold text-black mb-6">
            Nu ai produse în baza de date. Adaugă produse din panoul de administrare.
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-2 bg-yellow-400 rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
              🎉 CALCULATOR CATERING
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
              MENIU EVENIMENTE
            </h1>
            <p className="text-gray-700 font-semibold">
              Pricing pentru catering și evenimente • {products.length} produse
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle Buttons - ONLY 2 */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-black">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
              activeView === 'dashboard'
                ? 'bg-yellow-500 text-black scale-105'
                : 'bg-white text-black hover:bg-yellow-100'
            }`}
          >
            📊 DASHBOARD
          </button>

          <button
            onClick={() => setActiveView('offer')}
            className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
              activeView === 'offer'
                ? 'bg-yellow-500 text-black scale-105'
                : 'bg-white text-black hover:bg-yellow-100'
            }`}
          >
            📄 GENEREAZĂ OFERTĂ
          </button>
        </div>
      </div>

      {/* Content Area - Pass database products */}
      <div>
        {activeView === 'dashboard' && (
          <DashboardProduse products={products} calculatorType="catering" />
        )}

        {activeView === 'offer' && (
          <OfferGenerator products={products} />
        )}
      </div>
    </div>
  );
};

export default MenuCateringCalculator;