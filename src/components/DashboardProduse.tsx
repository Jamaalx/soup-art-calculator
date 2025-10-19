'use client';

import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { getCategoryIcon, getCategoryLabel, getCategoryColor } from '@/lib/data/categories';

interface DashboardProduseProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const DashboardProduse: React.FC<DashboardProduseProps> = ({ products, calculatorType }) => {
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get unique categories dynamically from products
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.is_active) {
        categories.add(p.category);
      }
    });
    return Array.from(categories).sort();
  }, [products]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(availableCategories));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    
    availableCategories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.is_active);
    });
    
    return grouped;
  }, [products, availableCategories]);

  const stats = useMemo(() => {
    const allProducts = products.filter(p => p.is_active);
    
    if (allProducts.length === 0) {
      return {
        totalProducts: 0,
        avgCost: 0,
        avgPriceOffline: 0,
        avgPriceOnline: 0,
        avgMarginOffline: 0,
        avgMarginOnline: 0
      };
    }

    const avgCost = allProducts.reduce((sum, p) => sum + p.pret_cost, 0) / allProducts.length;
    
    const avgPriceOffline = allProducts.reduce((sum, p) => 
      sum + (p.pret_offline || 0), 0) / allProducts.length;
    
    const avgPriceOnline = allProducts.reduce((sum, p) => 
      sum + (p.pret_online || 0), 0) / allProducts.length;
    
    const avgMarginOffline = avgCost > 0 ? ((avgPriceOffline - avgCost) / avgCost) * 100 : 0;
    const avgMarginOnline = avgCost > 0 ? ((avgPriceOnline - avgCost) / avgCost) * 100 : 0;

    return {
      totalProducts: allProducts.length,
      avgCost,
      avgPriceOffline,
      avgPriceOnline,
      avgMarginOffline,
      avgMarginOnline
    };
  }, [products]);

  return (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-6 text-black">
          📊 STATISTICI GENERALE
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border-2 border-black bg-yellow-200">
            <p className="text-xs font-black text-black">PRODUSE ACTIVE</p>
            <p className="text-3xl font-black text-black">{stats.totalProducts}</p>
          </div>
          
          <div className="p-4 rounded-2xl border-2 border-black bg-blue-200">
            <p className="text-xs font-black text-black">COST MEDIU</p>
            <p className="text-2xl font-black text-black">{stats.avgCost.toFixed(2)} LEI</p>
          </div>

          {calculatorType === 'offline' && (
            <>
              <div className="p-4 rounded-2xl border-2 border-black bg-green-200">
                <p className="text-xs font-black text-black">PREȚ MEDIU</p>
                <p className="text-2xl font-black text-black">{stats.avgPriceOffline.toFixed(2)} LEI</p>
              </div>
              
              <div className="p-4 rounded-2xl border-2 border-black bg-purple-200">
                <p className="text-xs font-black text-black">MARJĂ MEDIE</p>
                <p className="text-2xl font-black text-black">{stats.avgMarginOffline.toFixed(1)}%</p>
              </div>
            </>
          )}

          {calculatorType === 'online' && (
            <>
              <div className="p-4 rounded-2xl border-2 border-black bg-green-200">
                <p className="text-xs font-black text-black">PREȚ MEDIU</p>
                <p className="text-2xl font-black text-black">{stats.avgPriceOnline.toFixed(2)} LEI</p>
              </div>
              
              <div className="p-4 rounded-2xl border-2 border-black bg-purple-200">
                <p className="text-xs font-black text-black">MARJĂ MEDIE</p>
                <p className="text-2xl font-black text-black">{stats.avgMarginOnline.toFixed(1)}%</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Products by Category */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-black">
            📦 PRODUSE PE CATEGORII
          </h3>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-green-500 text-white rounded-xl border-2 border-black font-bold hover:bg-green-600"
            >
              ➕ DESCHIDE TOATE
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 bg-red-500 text-white rounded-xl border-2 border-black font-bold hover:bg-red-600"
            >
              ➖ ÎNCHIDE TOATE
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
            const icon = getCategoryIcon(category);
            const label = getCategoryLabel(category);
            const color = getCategoryColor(category);
            const isExpanded = expandedCategories.has(category);

            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="border-2 border-black rounded-2xl overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: `${color}40` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div className="text-left">
                      <p className="text-lg font-black text-black">{label}</p>
                      <p className="text-xs font-bold text-gray-700">
                        {categoryProducts.length} produse
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-700">COST MEDIU</p>
                      <p className="text-lg font-black text-black">
                        {(categoryProducts.reduce((sum, p) => sum + p.pret_cost, 0) / categoryProducts.length).toFixed(2)} LEI
                      </p>
                    </div>
                    <span className="text-2xl font-black text-black">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {/* Products List (Collapsible) */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      {categoryProducts.map((product) => {
                        const priceToUse = calculatorType === 'online' 
                          ? (product.pret_online || 0) 
                          : (product.pret_offline || 0);
                        const margin = product.pret_cost > 0 
                          ? ((priceToUse - product.pret_cost) / product.pret_cost) * 100 
                          : 0;

                        return (
                          <div 
                            key={product.id}
                            className="flex justify-between items-center p-3 rounded-xl border-2 border-gray-200 hover:border-black transition-all"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-black text-black">{product.nume}</p>
                              <p className="text-xs font-bold text-gray-700">{product.cantitate || 'N/A'}</p>
                            </div>
                            
                            <div className="flex gap-4 items-center">
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">COST</p>
                                <p className="text-sm font-black text-black">{product.pret_cost.toFixed(2)} lei</p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">PREȚ</p>
                                <p className="text-sm font-black text-black">{priceToUse.toFixed(2)} lei</p>
                              </div>
                              
                              <div className="text-right min-w-[80px]">
                                <p className="text-xs font-bold text-gray-700">MARJĂ</p>
                                <p className={`text-sm font-black ${
                                  margin >= 100 ? 'text-green-600' : 
                                  margin >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {margin.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Margin Products */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-xl font-black mb-4 text-black">
            🏆 CEL MAI MARE PROFIT
          </h3>
          <div className="space-y-3">
            {products
              .filter(p => p.is_active)
              .sort((a, b) => {
                const priceA = calculatorType === 'online' 
                  ? (a.pret_online || 0) 
                  : (a.pret_offline || 0);
                const priceB = calculatorType === 'online' 
                  ? (b.pret_online || 0) 
                  : (b.pret_offline || 0);
                const marginA = a.pret_cost > 0 
                  ? ((priceA - a.pret_cost) / a.pret_cost) * 100 
                  : 0;
                const marginB = b.pret_cost > 0 
                  ? ((priceB - b.pret_cost) / b.pret_cost) * 100 
                  : 0;
                return marginB - marginA;
              })
              .slice(0, 5)
              .map((product, index) => {
                const price = calculatorType === 'online' 
                  ? (product.pret_online || 0) 
                  : (product.pret_offline || 0);
                const margin = product.pret_cost > 0 
                  ? ((price - product.pret_cost) / product.pret_cost) * 100 
                  : 0;
                
                return (
                  <div key={product.id} className="p-3 rounded-xl border-2 border-black bg-green-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-black">#{index + 1}</span>
                        <p className="text-sm font-black text-black">{product.nume}</p>
                        <p className="text-xs font-bold text-gray-700">
                          {getCategoryLabel(product.category)}
                        </p>
                      </div>
                      <p className="text-xl font-black text-green-600">{margin.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Lowest Cost Products */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-xl font-black mb-4 text-black">
            💰 CEL MAI MIC COST
          </h3>
          <div className="space-y-3">
            {products
              .filter(p => p.is_active)
              .sort((a, b) => a.pret_cost - b.pret_cost)
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.id} className="p-3 rounded-xl border-2 border-black bg-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-black">#{index + 1}</span>
                      <p className="text-sm font-black text-black">{product.nume}</p>
                      <p className="text-xs font-bold text-gray-700">
                        {getCategoryLabel(product.category)}
                      </p>
                    </div>
                    <p className="text-xl font-black text-blue-600">{product.pret_cost.toFixed(2)} lei</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProduse;