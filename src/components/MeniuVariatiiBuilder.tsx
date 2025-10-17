'use client';

import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory, MenuCombination } from '@/types';

interface CategorySlot {
  id: string;
  category: ProductCategory;
}

interface MeniuVariatiiBuilderProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

interface CategorySlot {
  id: string;
  category: ProductCategory;
}

const MeniuVariatiiBuilder: React.FC<MeniuVariatiiBuilderProps> = ({ products, calculatorType }) => {
  
  const [categorySlots, setCategorySlots] = useState<CategorySlot[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<'margin' | 'profit' | 'cost'>('margin');
  const [pretVanzare, setPretVanzare] = useState<number>(35);

  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      if (p.isActive) acc[p.category].push(p);
      return acc;
    }, {} as Record<ProductCategory, Product[]>);
  }, [products]);

  const availableCategories = Object.keys(productsByCategory) as ProductCategory[];

  // Generate all combinations
  const combinations = useMemo<MenuCombination[]>(() => {
    if (categorySlots.length === 0 || !showResults) return [];

    const selectedBySlot: Record<string, Product[]> = {};
    
    categorySlots.forEach(slot => {
      const productIds = selectedProducts[slot.id] || [];
      selectedBySlot[slot.id] = products.filter(p => productIds.includes(p.id));
    });

    // Generate cartesian product
    const generate = (slots: CategorySlot[], index: number, current: Product[]): MenuCombination[] => {
      if (index === slots.length) {
        const totalCost = current.reduce((sum, p) => sum + p.pretCost, 0);
        const totalPrice = current.reduce((sum, p) => {
          const price = calculatorType === 'online' ? p.pretOnline : p.pretOffline;
          return sum + price;
        }, 0);
        const profit = totalPrice - totalCost;
        const marjaProfit = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return [{
          products: current.map(p => ({
            category: p.category,
            productId: p.id,
            productName: p.nume,
            price: calculatorType === 'online' ? p.pretOnline : p.pretOffline
          })),
          totalCost,
          totalPrice,
          profit,
          marjaProfit
        }];
      }

      const slot = slots[index];
      const slotProducts = selectedBySlot[slot.id] || [];
      const results: MenuCombination[] = [];

      for (const product of slotProducts) {
        results.push(...generate(slots, index + 1, [...current, product]));
      }

      return results;
    };

    const allCombinations = generate(categorySlots, 0, []);
    
    // Sort combinations
    return allCombinations.sort((a, b) => {
      if (sortBy === 'margin') return b.marjaProfit - a.marjaProfit;
      if (sortBy === 'profit') return b.profit - a.profit;
      return a.totalCost - b.totalCost;
    });
  }, [categorySlots, selectedProducts, products, calculatorType, showResults, sortBy]);

  const stats = useMemo(() => {
    if (combinations.length === 0) {
      return {
        total: 0,
        avgMargin: 0,
        avgProfit: 0,
        avgCost: 0,
        avgPrice: 0,
        profitabile: 0
      };
    }

    const total = combinations.length;
    const avgMargin = combinations.reduce((sum, c) => sum + c.marjaProfit, 0) / total;
    const avgProfit = combinations.reduce((sum, c) => sum + c.profit, 0) / total;
    const avgCost = combinations.reduce((sum, c) => sum + c.totalCost, 0) / total;
    const avgPrice = combinations.reduce((sum, c) => sum + c.totalPrice, 0) / total;
    const profitabile = combinations.filter(c => c.marjaProfit >= 100).length;

    return { total, avgMargin, avgProfit, avgCost, avgPrice, profitabile };
  }, [combinations]);

  const handleAddCategorySlot = (category: ProductCategory) => {
    const newSlot: CategorySlot = {
      id: `slot-${Date.now()}-${Math.random()}`,
      category
    };
    setCategorySlots([...categorySlots, newSlot]);
  };

  const handleRemoveCategorySlot = (slotId: string) => {
    setCategorySlots(categorySlots.filter(s => s.id !== slotId));
    const newSelected = { ...selectedProducts };
    delete newSelected[slotId];
    setSelectedProducts(newSelected);
  };

  const handleToggleProduct = (slotId: string, productId: string) => {
    const current = selectedProducts[slotId] || [];
    const newProducts = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    
    setSelectedProducts({
      ...selectedProducts,
      [slotId]: newProducts
    });
  };

  const handleSelectAllInSlot = (slotId: string, category: ProductCategory) => {
    const allIds = productsByCategory[category].map(p => p.id);
    setSelectedProducts({
      ...selectedProducts,
      [slotId]: allIds
    });
  };

  const handleGenerateCombinations = () => {
    if (categorySlots.length < 2) {
      alert('Adaugă minimum 2 categorii!');
      return;
    }
    
    const hasProducts = categorySlots.every(slot => (selectedProducts[slot.id]?.length || 0) > 0);
    if (!hasProducts) {
      alert('Selectează cel puțin un produs din fiecare categorie!');
      return;
    }

    setShowResults(true);
  };

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h2 className="text-3xl font-black text-black mb-2">🎨 MENIU CU VARIAȚII - BUILDER</h2>
        <p className="text-gray-700 font-semibold">
          Selectează categorii și produse pentru a genera toate combinațiile posibile.
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#9eff55]">
        <h3 className="text-2xl font-black text-black mb-6">1️⃣ ADAUGĂ CATEGORII (câte vrei, inclusiv duplicate)</h3>
        <p className="text-sm font-bold text-black mb-4">
          💡 Poți adăuga aceeași categorie de mai multe ori! Ex: 2x Ciorbă + 1x Fel Principal
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => handleAddCategorySlot(category)}
              className="p-6 rounded-2xl border-4 bg-white border-gray-300 hover:border-black hover:bg-[#9eff55] transition-all"
            >
              <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
              <div className="font-black text-black text-sm">{getCategoryName(category)}</div>
              <div className="text-xs text-gray-600 mt-1">
                {productsByCategory[category]?.length || 0} produse
              </div>
            </button>
          ))}
        </div>

        {/* Show Added Category Slots */}
        {categorySlots.length > 0 && (
          <div className="mt-6 p-6 bg-[#9eff55]/20 rounded-2xl border-2 border-[#9eff55]">
            <h4 className="font-black text-black mb-3">📋 CATEGORII ADĂUGATE ({categorySlots.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {categorySlots.map((slot, idx) => (
                <div 
                  key={slot.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-black"
                >
                  <span className="text-xl">{getCategoryIcon(slot.category)}</span>
                  <span className="font-bold text-black">{getCategoryName(slot.category)} #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveCategorySlot(slot.id)}
                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      {categorySlots.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#BBDCFF]">
          <h3 className="text-2xl font-black text-black mb-6">2️⃣ SELECTEAZĂ PRODUSE</h3>
          <div className="space-y-6">
            {categorySlots.map((slot, idx) => (
              <div key={slot.id} className="border-4 border-gray-300 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(slot.category)}</span>
                    <h4 className="text-xl font-black text-black">
                      {getCategoryName(slot.category)} #{idx + 1}
                    </h4>
                    <span className="text-sm text-gray-600">
                      ({selectedProducts[slot.id]?.length || 0} / {productsByCategory[slot.category]?.length || 0} selectate)
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectAllInSlot(slot.id, slot.category)}
                    className="px-4 py-2 bg-[#9eff55] rounded-xl font-bold border-2 border-black hover:scale-105 transition-transform"
                  >
                    ✅ Selectează Tot
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productsByCategory[slot.category]?.map(product => {
                    const isSelected = selectedProducts[slot.id]?.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleToggleProduct(slot.id, product.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'bg-[#9eff55] border-black shadow-lg'
                            : 'bg-gray-50 border-gray-300 hover:border-black'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-black text-sm">{product.nume}</span>
                          <span className="text-2xl">{isSelected ? '✅' : '⬜'}</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-bold">{product.pretCost.toFixed(2)} lei</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Preț:</span>
                            <span className="font-bold text-blue-600">
                              {(calculatorType === 'online' ? product.pretOnline : product.pretOffline).toFixed(2)} lei
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {categorySlots.length >= 2 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#FFC857]">
          <button
            onClick={handleGenerateCombinations}
            className="w-full p-8 bg-[#FFC857] rounded-2xl border-4 border-black font-black text-3xl hover:scale-105 transition-transform"
          >
            🚀 GENEREAZĂ COMBINAȚII
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && combinations.length > 0 && (
        <>
          {/* Stats */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black text-black mb-6">📊 STATISTICI GENERALE</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-6 bg-[#9eff55] rounded-2xl border-4 border-black">
                <p className="text-xs text-gray-700 mb-1">Total Combinații:</p>
                <p className="text-3xl font-black text-black">{stats.total}</p>
              </div>
              <div className="p-6 bg-[#BBDCFF] rounded-2xl border-4 border-black">
                <p className="text-xs text-gray-700 mb-1">Marjă Medie:</p>
                <p className="text-3xl font-black text-black">{stats.avgMargin.toFixed(0)}%</p>
              </div>
              <div className="p-6 bg-[#FFC857] rounded-2xl border-4 border-black">
                <p className="text-xs text-gray-700 mb-1">Profit Mediu:</p>
                <p className="text-3xl font-black text-black">{stats.avgProfit.toFixed(2)} lei</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border-4 border-black">
                <p className="text-xs text-gray-700 mb-1">Cost Mediu:</p>
                <p className="text-3xl font-black text-black">{stats.avgCost.toFixed(2)} lei</p>
              </div>
              <div className="p-6 bg-green-100 rounded-2xl border-4 border-green-600">
                <p className="text-xs text-gray-700 mb-1">Profitabile (≥100%):</p>
                <p className="text-3xl font-black text-green-600">{stats.profitabile}</p>
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-black">
            <div className="flex items-center gap-4">
              <span className="font-black text-black">SORTEAZĂ DUPĂ:</span>
              <button
                onClick={() => setSortBy('margin')}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${
                  sortBy === 'margin' ? 'bg-[#9eff55] border-black' : 'bg-white border-gray-300'
                }`}
              >
                📈 Marjă
              </button>
              <button
                onClick={() => setSortBy('profit')}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${
                  sortBy === 'profit' ? 'bg-[#9eff55] border-black' : 'bg-white border-gray-300'
                }`}
              >
                💰 Profit
              </button>
              <button
                onClick={() => setSortBy('cost')}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${
                  sortBy === 'cost' ? 'bg-[#9eff55] border-black' : 'bg-white border-gray-300'
                }`}
              >
                💵 Cost
              </button>
            </div>
          </div>

          {/* Combinations List */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black text-black mb-6">
              📋 TOATE COMBINAȚIILE ({combinations.length})
            </h3>
            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {combinations.slice(0, 100).map((combo, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border-4 ${
                    combo.marjaProfit >= 100 ? 'bg-green-50 border-green-600' :
                    combo.marjaProfit >= 50 ? 'bg-yellow-50 border-yellow-600' :
                    'bg-red-50 border-red-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-black">
                      #{idx + 1}
                    </span>
                    <div className="text-right">
                      <p className={`text-xl font-black ${
                        combo.marjaProfit >= 100 ? 'text-green-600' :
                        combo.marjaProfit >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {combo.marjaProfit.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">marjă</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2">PRODUSE:</p>
                      {combo.products.map((p, i) => (
                        <p key={i} className="text-sm font-bold text-black">
                          • {p.productName}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-600">Cost Total:</span>
                        <span className="font-black text-black">{combo.totalCost.toFixed(2)} lei</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-600">Preț Total:</span>
                        <span className="font-black text-blue-600">{combo.totalPrice.toFixed(2)} lei</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-600">Profit:</span>
                        <span className="font-black text-green-600">+{combo.profit.toFixed(2)} lei</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {combinations.length > 100 && (
                <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-600 text-center">
                  <p className="font-bold text-black">
                    📊 Se afișează primele 100 din {combinations.length} combinații
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MeniuVariatiiBuilder;