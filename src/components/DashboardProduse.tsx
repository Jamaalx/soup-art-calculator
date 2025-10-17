'use client';

import React, { useMemo } from 'react';
import type { Product, ProductCategory } from '@/types';

interface DashboardProduseProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const DashboardProduse: React.FC<DashboardProduseProps> = ({ products, calculatorType }) => {
  
  const analytics = useMemo(() => {
    // Calculate best margin products
    const withMargins = products.map(p => {
      const price = calculatorType === 'online' ? p.pretOnline : p.pretOffline;
      const profit = price - p.pretCost;
      const margin = (profit / p.pretCost) * 100;
      return { ...p, profit, margin, price };
    });

    const bestMargin = [...withMargins]
      .filter(p => p.isActive)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    const lowestCost = [...withMargins]
      .filter(p => p.isActive)
      .sort((a, b) => a.pretCost - b.pretCost)
      .slice(0, 5);

    const bestSelling = [...withMargins]
      .filter(p => p.isActive)
      .sort((a, b) => {
        const salesA = calculatorType === 'online' ? (a.salesOnline || 0) : (a.salesOffline || 0);
        const salesB = calculatorType === 'online' ? (b.salesOnline || 0) : (b.salesOffline || 0);
        return salesB - salesA;
      })
      .slice(0, 5);

    // Group by category
    const byCategory = products.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {} as Record<ProductCategory, Product[]>);

    // Calculate category stats
    const categoryStats = Object.entries(byCategory).map(([category, items]) => {
      const avgCost = items.reduce((sum, p) => sum + p.pretCost, 0) / items.length;
      const avgPrice = items.reduce((sum, p) => {
        const price = calculatorType === 'online' ? p.pretOnline : p.pretOffline;
        return sum + price;
      }, 0) / items.length;
      const totalSales = items.reduce((sum, p) => {
        return sum + (calculatorType === 'online' ? (p.salesOnline || 0) : (p.salesOffline || 0));
      }, 0);

      return {
        category,
        count: items.length,
        avgCost,
        avgPrice,
        totalSales,
        avgMargin: ((avgPrice - avgCost) / avgCost) * 100
      };
    });

    return {
      bestMargin,
      lowestCost,
      bestSelling,
      byCategory,
      categoryStats
    };
  }, [products, calculatorType]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'ciorbe': '🍲',
      'fel_Principal': '🍖',
      'garnituri': '🥔',
      'desert': '🍰',
      'salate': '🥗',
      'bauturi': '🥤',
      'vinuri': '🍷',
      'auxiliare': '🍞',
      'placinte': '🥧'
    };
    return icons[category] || '📦';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'ciorbe': 'Ciorbe',
      'fel_Principal': 'Feluri Principale',
      'garnituri': 'Garnituri',
      'desert': 'Desert',
      'salate': 'Salate',
      'bauturi': 'Băuturi',
      'vinuri': 'Vinuri',
      'auxiliare': 'Auxiliare',
      'placinte': 'Plăcinte'
    };
    return names[category] || category;
  };

  const priceLabel = calculatorType === 'online' ? 'Online' : 'Offline';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-black mb-2">📊 DASHBOARD PRODUSE</h2>
            <p className="text-gray-700 font-semibold">
              Analiză produse pentru vânzare {priceLabel.toLowerCase()}
            </p>
          </div>
          <div className="px-6 py-3 bg-[#9eff55] rounded-2xl border-4 border-black">
            <p className="text-xs font-bold text-black">TOTAL PRODUSE</p>
            <p className="text-4xl font-black text-black">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black text-black mb-6">📈 STATISTICI PE CATEGORII</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.categoryStats.map((stat, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl border-4 border-black bg-gradient-to-br from-[#BBDCFF] to-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{getCategoryIcon(stat.category)}</span>
                <div>
                  <p className="text-lg font-black text-black">{getCategoryName(stat.category)}</p>
                  <p className="text-xs text-gray-600">{stat.count} produse</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">Cost mediu:</span>
                  <span className="font-black">{stat.avgCost.toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Preț mediu:</span>
                  <span className="font-black">{stat.avgPrice.toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Marjă medie:</span>
                  <span className="font-black text-green-600">{stat.avgMargin.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Vânzări totale:</span>
                  <span className="font-black text-blue-600">{stat.totalSales}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Best Margin */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-600">
          <h3 className="text-xl font-black text-green-600 mb-4 flex items-center gap-2">
            📈 TOP 5 MARJĂ
          </h3>
          <div className="space-y-3">
            {analytics.bestMargin.map((p, idx) => (
              <div 
                key={p.id}
                className="p-4 rounded-xl bg-green-50 border-2 border-green-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-800">{p.nume}</span>
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-black">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-bold">{p.pretCost.toFixed(2)} lei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preț {priceLabel}:</span>
                    <span className="font-bold">{p.price.toFixed(2)} lei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marjă:</span>
                    <span className="font-black text-green-600">{p.margin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Cost */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-600">
          <h3 className="text-xl font-black text-blue-600 mb-4 flex items-center gap-2">
            💰 TOP 5 COST MINIM
          </h3>
          <div className="space-y-3">
            {analytics.lowestCost.map((p, idx) => (
              <div 
                key={p.id}
                className="p-4 rounded-xl bg-blue-50 border-2 border-blue-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-800">{p.nume}</span>
                  <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-black">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-black text-blue-600">{p.pretCost.toFixed(2)} lei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preț {priceLabel}:</span>
                    <span className="font-bold">{p.price.toFixed(2)} lei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit:</span>
                    <span className="font-bold text-green-600">+{p.profit.toFixed(2)} lei</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-600">
          <h3 className="text-xl font-black text-yellow-600 mb-4 flex items-center gap-2">
            🔥 TOP 5 CELE MAI VÂNDUTE
          </h3>
          <div className="space-y-3">
            {analytics.bestSelling.map((p, idx) => {
              const sales = calculatorType === 'online' ? (p.salesOnline || 0) : (p.salesOffline || 0);
              return (
                <div 
                  key={p.id}
                  className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-800">{p.nume}</span>
                    <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs font-black">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vânzări/lună:</span>
                      <span className="font-black text-yellow-600">{sales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit/buc:</span>
                      <span className="font-bold text-green-600">+{p.profit.toFixed(2)} lei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue total:</span>
                      <span className="font-black text-blue-600">{(sales * p.profit).toFixed(2)} lei</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Products by Category */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black text-black mb-6">📋 TOATE PRODUSELE</h3>
        <div className="space-y-6">
          {Object.entries(analytics.byCategory).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#FFC857] rounded-xl border-2 border-black">
                <span className="text-3xl">{getCategoryIcon(category)}</span>
                <h4 className="text-lg font-black text-black">
                  {getCategoryName(category)} ({items.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.filter(p => p.isActive).map(product => {
                  const price = calculatorType === 'online' ? product.pretOnline : product.pretOffline;
                  const profit = price - product.pretCost;
                  const margin = (profit / product.pretCost) * 100;
                  const sales = calculatorType === 'online' ? (product.salesOnline || 0) : (product.salesOffline || 0);
                  
                  return (
                    <div 
                      key={product.id}
                      className="p-4 rounded-xl border-2 border-gray-300 bg-gray-50 hover:shadow-lg transition-shadow"
                    >
                      <p className="font-bold text-gray-800 mb-2">{product.nume}</p>
                      <p className="text-xs text-gray-600 mb-3">{product.cantitate}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-bold">{product.pretCost.toFixed(2)} lei</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preț {priceLabel}:</span>
                          <span className="font-bold">{price.toFixed(2)} lei</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Marjă:</span>
                          <span className="font-bold text-green-600">{margin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vânzări:</span>
                          <span className="font-bold text-blue-600">{sales}/lună</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardProduse;