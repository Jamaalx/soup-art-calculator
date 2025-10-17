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

const MenuOfflineCalculator = () => {
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
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-100 via-white to-pink-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-purple-400 rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
                🍽️ CALCULATOR OFFLINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
                MENIU RESTAURANT
              </h1>
              <p className="text-gray-700 font-semibold">
                Pricing pentru meniu in restaurant
              </p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white border-4 border-black">
              <p className="text-xs font-bold opacity-90">CALCULATOR</p>
              <p className="text-xl font-black">OFFLINE</p>
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
                  ? 'bg-purple-500 text-white scale-105'
                  : 'bg-white text-black hover:bg-purple-100'
              }`}
            >
              📊 DASHBOARD
            </button>
            
            <button
              onClick={() => setActiveView('fix')}
              className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
                activeView === 'fix'
                  ? 'bg-purple-500 text-white scale-105'
                  : 'bg-white text-black hover:bg-purple-100'
              }`}
            >
              🔒 MENIU FIX
            </button>
            
            <button
              onClick={() => setActiveView('variatii')}
              className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
                activeView === 'variatii'
                  ? 'bg-purple-500 text-white scale-105'
                  : 'bg-white text-black hover:bg-purple-100'
              }`}
            >
              🎨 MENIU VARIAȚII
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeView === 'dashboard' && (
            <DashboardProduse products={allProducts} calculatorType="offline" />
          )}
          
          {activeView === 'fix' && (
            <MeniuFixBuilder products={allProducts} calculatorType="offline" />
          )}
          
          {activeView === 'variatii' && (
            <MeniuVariatiiBuilder products={allProducts} calculatorType="offline" />
          )}
        </div>

        {/* Footer */}
        <div className="bg-black rounded-3xl shadow-2xl p-8 text-white border-4 border-black mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-white mb-2">
                Calculator dezvoltat pentru <strong className="text-purple-400">OFFLINE RESTAURANT</strong>
              </p>
              <p className="text-sm text-gray-400">© 2025 | Date actualizate: Octombrie 2025</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Powered by</p>
              <a 
                href="https://www.zed-zen.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl hover:scale-105 transition-transform border-2 border-white"
              >
                <div className="text-4xl font-black text-black">Z</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-black tracking-widest">ZED</span>
                  <span className="text-xs font-black text-black tracking-widest">ZEN</span>
                </div>
              </a>
              <p className="text-xs text-gray-400 text-center">www.zed-zen.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOfflineCalculator;