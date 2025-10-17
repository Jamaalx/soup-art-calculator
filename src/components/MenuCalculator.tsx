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
import MeniuFixBuilder from './MenuFixBuilder';
import MeniuVariatiiBuilder from './MeniuVariatiiBuilder';

type ViewMode = 'dashboard' | 'fix' | 'variatii';

const MenuCalculator = () => {
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
                Pricing pentru comenzi online cu livrare
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

        {/* Content Area */}
        <div>
          {activeView === 'dashboard' && (
            <DashboardProduse products={allProducts} calculatorType="online" />
          )}
          
          {activeView === 'fix' && (
            <MeniuFixBuilder products={allProducts} calculatorType="online" />
          )}
          
          {activeView === 'variatii' && (
            <MeniuVariatiiBuilder products={allProducts} calculatorType="online" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCalculator;