'use client';

import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory } from '@/types';
import { CATEGORIES, getCategoryIcon, getCategoryLabel } from '@/lib/data/categories';

interface DashboardProduseProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const DashboardProduse: React.FC<DashboardProduseProps> = ({ products, calculatorType }) => {
  
  const [expandedCategories, setExpandedCategories] = useState<Set<ProductCategory>>(new Set());

  const toggleCategory = (category: ProductCategory) => {
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
    const allCategories: ProductCategory[] = [
      'ciorbe', 'felPrincipal', 'garnituri', 'desert', 
      'salate', 'bauturi', 'vinuri', 'placinte'
    ];
    setExpandedCategories(new Set(allCategories));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const productsByCategory = useMemo(() => {
    const grouped: Record<ProductCategory, Product[]> = {} as Record<ProductCategory, Product[]>;
    const categories: ProductCategory[] = [
      'ciorbe', 'felPrincipal', 'garnituri', 'desert', 
      'salate', 'bauturi', 'vinuri', 'placinte'
    ];
    
    categories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.isActive);
    });
    
    return grouped;
  }, [products]);

  const stats = useMemo(() => {
    const allProducts = products.filter(p => p.isActive);
    
    const avgCost = allProducts.reduce((sum, p) => sum + p.pretCost, 0) / allProducts.length;
    const avgPriceOffline = allProducts.reduce((sum, p) => sum + p.pretOffline, 0) / allProducts.length;
    const avgPriceOnline = allProducts.reduce((sum, p) => sum + p.pretOnline, 0) / allProducts.length;
    
    const avgMarginOffline = ((avgPriceOffline - avgCost) / avgCost) * 100;
    const avgMarginOnline = ((avgPriceOnline - avgCost) / avgCost) * 100;

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
            const cat = category as ProductCategory;
            const categoryInfo = CATEGORIES[cat];
            const isExpanded = expandedCategories.has(cat);

            if (categoryProducts.length === 0) return null;

            return (
              <div key={cat} className="border-2 border-black rounded-2xl overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: `${categoryInfo.color}40` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{categoryInfo.icon}</span>
                    <div className="text-left">
                      <p className="text-lg font-black text-black">{categoryInfo.label}</p>
                      <p className="text-xs font-bold text-gray-700">
                        {categoryProducts.length} produse
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-700">COST MEDIU</p>
                      <p className="text-lg font-black text-black">
                        {(categoryProducts.reduce((sum, p) => sum + p.pretCost, 0) / categoryProducts.length).toFixed(2)} LEI
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
                        const priceToUse = calculatorType === 'online' ? product.pretOnline : product.pretOffline;
                        const margin = ((priceToUse - product.pretCost) / product.pretCost) * 100;

                        return (
                          <div 
                            key={product.id}
                            className="flex justify-between items-center p-3 rounded-xl border-2 border-gray-200 hover:border-black transition-all"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-black text-black">{product.nume}</p>
                              <p className="text-xs font-bold text-gray-700">{product.cantitate}</p>
                            </div>
                            
                            <div className="flex gap-4 items-center">
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">COST</p>
                                <p className="text-sm font-black text-black">{product.pretCost.toFixed(2)} lei</p>
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
              .filter(p => p.isActive)
              .sort((a, b) => {
                const priceA = calculatorType === 'online' ? a.pretOnline : a.pretOffline;
                const priceB = calculatorType === 'online' ? b.pretOnline : b.pretOffline;
                const marginA = ((priceA - a.pretCost) / a.pretCost) * 100;
                const marginB = ((priceB - b.pretCost) / b.pretCost) * 100;
                return marginB - marginA;
              })
              .slice(0, 5)
              .map((product, index) => {
                const price = calculatorType === 'online' ? product.pretOnline : product.pretOffline;
                const margin = ((price - product.pretCost) / product.pretCost) * 100;
                
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
              .filter(p => p.isActive)
              .sort((a, b) => a.pretCost - b.pretCost)
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
                    <p className="text-xl font-black text-blue-600">{product.pretCost.toFixed(2)} lei</p>
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