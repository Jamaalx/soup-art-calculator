'use client';

import React, { useState } from 'react';
import { 
  CIORBE, 
  FELPRINCIPAL, 
  GARNITURI, 
  DESERT, 
  PLACINTE, 
  BAUTURI, 
  VINURI, 
  AUXILIARE,
  SALATE 
} from '@/lib/data/products';
import DashboardProduse from './DashboardProduse';
import OfferGenerator from './OfferGenerator';

type ViewMode = 'dashboard' | 'offer';

const MenuCateringCalculator = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');

  // Combine ALL products from ALL categories
  const allProducts = [
    ...CIORBE,
    ...FELPRINCIPAL,
    ...GARNITURI,
    ...DESERT,
    ...PLACINTE,
    ...BAUTURI,
    ...VINURI,
    ...AUXILIARE,
    ...SALATE
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-yellow-100 via-white to-orange-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-yellow-400 rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
                🎉 CALCULATOR CATERING
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
                MENIU EVENIMENTE
              </h1>
              <p className="text-gray-700 font-semibold">
                Pricing pentru catering și evenimente
              </p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white border-4 border-black">
              <p className="text-xs font-bold opacity-90">CALCULATOR</p>
              <p className="text-xl font-black">CATERING</p>
            </div>
          </div>
        </div>

        {/* View Toggle Buttons - ONLY 2 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-4 border-black">
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

        {/* Content Area */}
        <div>
          {activeView === 'dashboard' && (
            <DashboardProduse products={allProducts} calculatorType="catering" />
          )}

          {activeView === 'offer' && (
            <OfferGenerator products={allProducts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCateringCalculator;