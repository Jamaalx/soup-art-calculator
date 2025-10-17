'use client';

import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory, MenuCombination } from '@/types';
import { CATEGORIES, getCategoryIcon, getCategoryLabel } from '@/lib/data/categories';

interface CategorySlot {
  id: string;
  category: ProductCategory;
  selectedProducts: string[]; // Array of product IDs
}

interface MeniuVariatiiBuilderProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const MeniuVariatiiBuilder: React.FC<MeniuVariatiiBuilderProps> = ({ products, calculatorType }) => {
  
  const [categorySlots, setCategorySlots] = useState<CategorySlot[]>([]);
  const [menuPrice, setMenuPrice] = useState<number>(35);
  const [generatedCombinations, setGeneratedCombinations] = useState<MenuCombination[]>([]);
  const [sortBy, setSortBy] = useState<'marjaProfit' | 'profit' | 'costTotal'>('marjaProfit');

  // Online calculator costs
  const AMBALAJ_COST = 3.0; // 3 lei per menu
  const APP_COMMISSION = 0.363; // 36.3%
  
  const availableCategories: ProductCategory[] = [
    'ciorbe', 'felPrincipal', 'garnituri', 'desert', 'salate', 
    'bauturi', 'vinuri', 'placinte'
  ];

  const productsByCategory = useMemo(() => {
    const grouped: Record<ProductCategory, Product[]> = {} as Record<ProductCategory, Product[]>;
    availableCategories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.isActive);
    });
    return grouped;
  }, [products]);

  const handleAddCategory = (category: ProductCategory) => {
    setCategorySlots(prev => [...prev, { 
      id: `${category}-${Date.now()}`, 
      category,
      selectedProducts: []
    }]);
  };

  const handleRemoveSlot = (slotId: string) => {
    setCategorySlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleToggleProduct = (slotId: string, productId: string) => {
    setCategorySlots(prev => prev.map(slot => {
      if (slot.id !== slotId) return slot;
      
      const isSelected = slot.selectedProducts.includes(productId);
      return {
        ...slot,
        selectedProducts: isSelected
          ? slot.selectedProducts.filter(id => id !== productId)
          : [...slot.selectedProducts, productId]
      };
    }));
  };

  const handleSelectAll = (slotId: string) => {
    setCategorySlots(prev => prev.map(slot => {
      if (slot.id !== slotId) return slot;
      const allProducts = productsByCategory[slot.category]?.map(p => p.id) || [];
      return {
        ...slot,
        selectedProducts: allProducts
      };
    }));
  };

  const handleDeselectAll = (slotId: string) => {
    setCategorySlots(prev => prev.map(slot => {
      if (slot.id !== slotId) return slot;
      return { ...slot, selectedProducts: [] };
    }));
  };

  const totalSelectedProducts = useMemo(() => {
    return categorySlots.reduce((sum, slot) => sum + slot.selectedProducts.length, 0);
  }, [categorySlots]);

  const handleGenerateCombinations = () => {
    const validSlots = categorySlots.filter(slot => slot.selectedProducts.length > 0);
    if (validSlots.length < 2) {
      alert('Te rog adaugă minimum 2 categorii cu produse selectate!');
      return;
    }

    const generateCombinations = (slots: CategorySlot[], index: number, current: Product[]): MenuCombination[] => {
      if (index === slots.length) {
        if (current.length < 2) return [];
        
        // Calculate food cost
        const foodCost = current.reduce((sum, p) => sum + p.pretCost, 0);
        
        // Calculate total cost based on calculator type
        let costTotal = foodCost;
        if (calculatorType === 'online') {
          const AMBALAJ_COST = 3.0;
          const appCommissionAmount = menuPrice * APP_COMMISSION;
          costTotal = foodCost + AMBALAJ_COST + appCommissionAmount;
        }
        // For offline/catering: costTotal = foodCost (no extra costs)
        
        // Calculate individual price (what customer would pay separately)
        const pretIndividual = current.reduce((sum, p) => 
          sum + (calculatorType === 'online' ? p.pretOnline : p.pretOffline), 0);
        
        // Profit and margin
        const profit = menuPrice - costTotal;
        const marjaProfit = (profit / costTotal) * 100;
        
        // Discount for customer
        const discount = pretIndividual - menuPrice;
        const discountPercent = (discount / pretIndividual) * 100;

        return [{
          products: [...current],
          costTotal,
          pretIndividual,
          pretMeniu: menuPrice,
          profit,
          marjaProfit,
          discount,
          discountPercent
        }];
      }

      const slot = validSlots[index];
      const results: MenuCombination[] = [];

      for (const productId of slot.selectedProducts) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const combos = generateCombinations(slots, index + 1, [...current, product]);
          results.push(...combos);
        }
      }

      return results;
    };

    const allCombos = generateCombinations(validSlots, 0, []);
    
    // Sort combinations
    const sorted = allCombos.sort((a, b) => {
      if (sortBy === 'marjaProfit') return b.marjaProfit - a.marjaProfit;
      if (sortBy === 'profit') return b.profit - a.profit;
      return a.costTotal - b.costTotal;
    }).slice(0, 100); // Show only top 100

    setGeneratedCombinations(sorted);
  };

  const handleReset = () => {
    setCategorySlots([]);
    setGeneratedCombinations([]);
    setMenuPrice(35);
  };

  const stats = useMemo(() => {
    if (generatedCombinations.length === 0) return null;

    const marje = generatedCombinations.map(c => c.marjaProfit);
    const profituri = generatedCombinations.map(c => c.profit);
    const costuri = generatedCombinations.map(c => c.costTotal);

    return {
      totalCombinations: generatedCombinations.length,
      marjaMin: Math.min(...marje),
      marjaMax: Math.max(...marje),
      marjaMedie: marje.reduce((a, b) => a + b, 0) / marje.length,
      profitMediu: profituri.reduce((a, b) => a + b, 0) / profituri.length,
      costMediu: costuri.reduce((a, b) => a + b, 0) / costuri.length,
      profitabile: generatedCombinations.filter(c => c.marjaProfit >= 100).length
    };
  }, [generatedCombinations]);

  return (
    <div className="space-y-6">
      
      {/* Step 1: Add Categories */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          📋 PASUL 1: ADAUGĂ CATEGORII
        </h3>
        <p className="text-sm font-bold text-gray-700 mb-4">
          Selectează categoriile pentru meniu (minimum 2)
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableCategories.map(category => {
            const categoryInfo = CATEGORIES[category];
            const count = productsByCategory[category]?.length || 0;
            
            return (
              <button
                key={category}
                onClick={() => handleAddCategory(category)}
                disabled={count === 0}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-4 border-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: categoryInfo.color }}
              >
                <span className="text-3xl">{categoryInfo.icon}</span>
                <span className="text-xs font-black text-black text-center">
                  {categoryInfo.label}
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {count} produse
                </span>
              </button>
            );
          })}
        </div>

        {/* Added Categories Display */}
        {categorySlots.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-100 rounded-2xl border-2 border-black">
            <p className="text-sm font-black text-black mb-3">
              CATEGORII ADĂUGATE ({categorySlots.length}) | PRODUSE: {totalSelectedProducts}
            </p>
            <div className="flex flex-wrap gap-2">
              {categorySlots.map((slot, index) => {
                const categoryInfo = CATEGORIES[slot.category];
                return (
                  <div 
                    key={slot.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-black"
                    style={{ backgroundColor: categoryInfo.color }}
                  >
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <span className="text-xs font-black text-black">
                      #{index + 1} {categoryInfo.label} ({slot.selectedProducts.length})
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="ml-2 px-2 py-1 bg-black text-white rounded-lg text-xs font-bold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Select Products from Each Category */}
      {categorySlots.length >= 2 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black mb-4 text-black">
            🎯 PASUL 2: SELECTEAZĂ PRODUSELE
          </h3>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Alege produsele din fiecare categorie (poți selecta multiple)
          </p>

          <div className="space-y-6">
            {categorySlots.map((slot, index) => {
              const categoryInfo = CATEGORIES[slot.category];
              const categoryProducts = productsByCategory[slot.category] || [];

              return (
                <div key={slot.id} className="p-4 rounded-2xl border-2 border-black" style={{ backgroundColor: `${categoryInfo.color}40` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      <span className="text-sm font-black text-black">
                        #{index + 1} {categoryInfo.label}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        ({slot.selectedProducts.length}/{categoryProducts.length} selectate)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectAll(slot.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"
                      >
                        ✓ TOATE
                      </button>
                      <button
                        onClick={() => handleDeselectAll(slot.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                      >
                        ✕ NICIUNA
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryProducts.map(product => {
                      const isSelected = slot.selectedProducts.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleToggleProduct(slot.id, product.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected 
                              ? 'border-black bg-green-200 font-black' 
                              : 'border-gray-300 bg-white font-bold hover:border-black'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-black">{product.nume}</span>
                            <span className="text-xs font-bold text-gray-800">
                              {product.pretCost.toFixed(2)} lei
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-xs text-green-600 font-black">✓ SELECTAT</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Set Price & Generate */}
      {categorySlots.length >= 2 && totalSelectedProducts >= 2 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black mb-4 text-black">
            💰 PASUL 3: SETEAZĂ PREȚUL ȘI GENEREAZĂ
          </h3>

          {/* Price Slider */}
          <div className="mb-6">
            <label className="block text-sm font-black text-black mb-2">
              PREȚ MENIU: {menuPrice.toFixed(2)} LEI
            </label>
            <input
              type="range"
              min="20"
              max="80"
              step="0.5"
              value={menuPrice}
              onChange={(e) => setMenuPrice(parseFloat(e.target.value))}
              className="w-full h-4 bg-yellow-300 rounded-lg cursor-pointer border-2 border-black"
            />
            <div className="flex justify-between text-xs font-bold text-black mt-1">
              <span>20 LEI</span>
              <span>80 LEI</span>
            </div>
          </div>

          {/* Online Cost Info */}
          <div className="mb-6 p-4 bg-blue-100 rounded-2xl border-2 border-black">
            <p className="text-sm font-black text-black mb-2">📦 COSTURI ONLINE INCLUSE:</p>
            <p className="text-xs font-bold text-black">• Ambalaj: {AMBALAJ_COST.toFixed(2)} LEI / meniu</p>
            <p className="text-xs font-bold text-black">• Comision aplicație: {(APP_COMMISSION * 100).toFixed(1)}% din preț</p>
            <p className="text-xs font-bold text-gray-700 mt-2">
              Total comision: {(menuPrice * APP_COMMISSION).toFixed(2)} LEI
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateCombinations}
            className="w-full py-4 bg-green-500 text-white rounded-2xl border-4 border-black font-black text-lg hover:bg-green-600"
          >
            🚀 GENEREAZĂ COMBINAȚII
          </button>
        </div>
      )}

      {/* Results View */}
      {generatedCombinations.length > 0 && (
        <>
          {/* Stats Overview */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-black">
                📊 REZULTATE COMBINAȚII
              </h3>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-red-500 text-white rounded-xl border-2 border-black font-bold hover:bg-red-600"
              >
                🔄 RESETEAZĂ
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl border-2 border-black bg-yellow-200">
                <p className="text-xs font-black text-black">COMBINAȚII</p>
                <p className="text-2xl font-black text-black">{stats?.totalCombinations}</p>
              </div>
              <div className="p-4 rounded-2xl border-2 border-black bg-green-200">
                <p className="text-xs font-black text-black">MARJĂ MEDIE</p>
                <p className="text-2xl font-black text-black">{stats?.marjaMedie.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-2xl border-2 border-black bg-blue-200">
                <p className="text-xs font-black text-black">PROFIT MEDIU</p>
                <p className="text-2xl font-black text-black">{stats?.profitMediu.toFixed(2)} LEI</p>
              </div>
              <div className="p-4 rounded-2xl border-2 border-black bg-purple-200">
                <p className="text-xs font-black text-black">PROFITABILE</p>
                <p className="text-2xl font-black text-black">{stats?.profitabile}</p>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSortBy('marjaProfit');
                  handleGenerateCombinations();
                }}
                className={`px-4 py-2 rounded-xl border-2 border-black font-bold ${
                  sortBy === 'marjaProfit' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
              >
                SORTEAZĂ: MARJĂ
              </button>
              <button
                onClick={() => {
                  setSortBy('profit');
                  handleGenerateCombinations();
                }}
                className={`px-4 py-2 rounded-xl border-2 border-black font-bold ${
                  sortBy === 'profit' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
              >
                SORTEAZĂ: PROFIT
              </button>
              <button
                onClick={() => {
                  setSortBy('costTotal');
                  handleGenerateCombinations();
                }}
                className={`px-4 py-2 rounded-xl border-2 border-black font-bold ${
                  sortBy === 'costTotal' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
              >
                SORTEAZĂ: COST
              </button>
            </div>
          </div>

          {/* Combinations List */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black mb-4 text-black">
              📋 TOP {generatedCombinations.length} COMBINAȚII
            </h3>

            <div className="space-y-3">
              {generatedCombinations.map((combo, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-2xl border-4 border-black ${
                    combo.marjaProfit >= 100 ? 'bg-green-200' :
                    combo.marjaProfit >= 50 ? 'bg-yellow-200' : 'bg-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-black">
                      #{index + 1}
                    </span>
                    <span className="text-lg font-black text-black">
                      {combo.marjaProfit.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {combo.products.map((product, idx) => (
                      <p key={idx} className="text-xs font-bold text-black">
                        • {getCategoryLabel(product.category)}: {product.nume}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t-2 border-black">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">COST</p>
                      <p className="text-sm font-black text-black">{combo.costTotal.toFixed(2)} LEI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">MENIU</p>
                      <p className="text-sm font-black text-black">{combo.pretMeniu.toFixed(2)} LEI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">PROFIT</p>
                      <p className={`text-sm font-black ${combo.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {combo.profit >= 0 ? '+' : ''}{combo.profit.toFixed(2)} LEI
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">DISCOUNT</p>
                      <p className="text-sm font-black text-green-600">{combo.discountPercent.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MeniuVariatiiBuilder;