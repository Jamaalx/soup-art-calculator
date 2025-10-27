'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import DashboardProduse from './DashboardProduse';
import MeniuFixBuilder from './MenuFixBuilder';
import MeniuVariatiiBuilder from './MeniuVariatiiBuilder';
import { AlertTriangle, RefreshCw, Package, Plus, Utensils, BarChart, Lock, Palette } from 'lucide-react';

type ViewMode = 'dashboard' | 'fix' | 'variatii';

const MenuOfflineCalculator = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const { t } = useLanguage();

  // Fetch products from Supabase (respects RLS)
  const { products, loading, error } = useProducts();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">{t('loading-products')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-red-900 mb-2">{t('error-loading-products')}</h3>
        <p className="text-red-700 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {t('try-again')}
        </button>
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-12 text-center">
        <Package className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-yellow-900 mb-2">{t('no-products-found')}</h3>
        <p className="text-yellow-700 mb-6">
          {t('no-products-desc')}
        </p>
        <a
          href="/dashboard/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition"
        >
          <Plus className="w-4 h-4" />
          {t('add-products')}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Utensils className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">{t('restaurant-calculator')}</span>
            </div>
            <h1 className="text-4xl font-black mb-2">{t('restaurant-menu-pricing')}</h1>
            <p className="text-purple-100">
              {t('calculate-prices-for-dine-in')} • {products.length} {t('products-available')}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle Buttons */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                activeView === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart className="w-5 h-5" />
              {t('dashboard')}
            </button>

            <button
              onClick={() => setActiveView('fix')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                activeView === 'fix'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock className="w-5 h-5" />
              {t('fixed-menu')}
            </button>

            <button
              onClick={() => setActiveView('variatii')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                activeView === 'variatii'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette className="w-5 h-5" />
              {t('menu-variations')}
            </button>
          </div>
        </div>

        {/* Content Area - Pass database products */}
        <div className="p-6">
          {activeView === 'dashboard' && (
            <DashboardProduse products={products} calculatorType="offline" />
          )}
          
          {activeView === 'fix' && (
            <MeniuFixBuilder products={products} calculatorType="offline" />
          )}
          
          {activeView === 'variatii' && (
            <MeniuVariatiiBuilder products={products} calculatorType="offline" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuOfflineCalculator;