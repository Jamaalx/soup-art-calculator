'use client';

import React, { useState } from 'react';
import { CIORBE, FELPRINCIPAL, GARNITURI, DESERT, SALATE, BAUTURI, VINURI, AUXILIARE } from '@/lib/data/products';
import DashboardProduse from './DashboardProduse';
import MeniuFixBuilder from './MenuFixBuilder';
import MeniuVariatiiBuilder from './MeniuVariatiiBuilder';

type ViewMode = 'dashboard' | 'fix' | 'variatii';

const MenuOnlineCalculator = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  // Combine all products
  const allProducts = [
    ...CIORBE,
    ...FELPRINCIPAL,
    ...GARNITURI,
    ...DESERT,
    ...SALATE,
    ...BAUTURI,
    ...VINURI,
    ...AUXILIARE
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-[#9eff55] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
                🚀 CALCULATOR ONLINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
                MENIU LIVRARE
              </h1>
              <p className="text-gray-700 font-semibold">Pricing pentru comenzi online cu livrare</p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white border-4 border-black">
              <p className="text-xs font-bold opacity-90">TIP</p>
              <p className="text-xl font-black">B2C ONLINE</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-4 border-black">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            
            {/* Dashboard Button */}
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex-1 p-6 rounded-2xl border-4 font-black text-lg transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-[#BBDCFF] border-black scale-105 shadow-2xl'
                  : 'bg-white border-gray-300 hover:border-black hover:scale-102'
              }`}
            >
              <div className="text-4xl mb-2">📊</div>
              <div className="text-black">DASHBOARD</div>
              <div className="text-xs text-gray-600 mt-1">Produse & Analiză</div>
            </button>

            {/* Meniu Fix Button */}
            <button
              onClick={() => setViewMode('fix')}
              className={`flex-1 p-6 rounded-2xl border-4 font-black text-lg transition-all ${
                viewMode === 'fix'
                  ? 'bg-[#FFC857] border-black scale-105 shadow-2xl'
                  : 'bg-white border-gray-300 hover:border-black hover:scale-102'
              }`}
            >
              <div className="text-4xl mb-2">🔒</div>
              <div className="text-black">MENIU FIX</div>
              <div className="text-xs text-gray-600 mt-1">Combo-uri Preț Fix</div>
            </button>

            {/* Meniu cu Variații Button */}
            <button
              onClick={() => setViewMode('variatii')}
              className={`flex-1 p-6 rounded-2xl border-4 font-black text-lg transition-all ${
                viewMode === 'variatii'
                  ? 'bg-[#9eff55] border-black scale-105 shadow-2xl'
                  : 'bg-white border-gray-300 hover:border-black hover:scale-102'
              }`}
            >
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-black">MENIU VARIAȚII</div>
              <div className="text-xs text-gray-600 mt-1">Combinații Personalizate</div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {viewMode === 'dashboard' && (
            <DashboardProduse 
              products={allProducts} 
              calculatorType="online"
            />
          )}

          {viewMode === 'fix' && (
            <MeniuFixBuilder 
              products={allProducts} 
              calculatorType="online"
            />
          )}

          {viewMode === 'variatii' && (
            <MeniuVariatiiBuilder 
              products={allProducts} 
              calculatorType="online"
            />
          )}
        </div>


      </div>
    </div>
  );
};

export default MenuOnlineCalculator;