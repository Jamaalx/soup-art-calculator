'use client';

import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory, FixedMenuCombo } from '@/types';

interface MeniuFixBuilderProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const MeniuFixBuilder: React.FC<MeniuFixBuilderProps> = ({ products, calculatorType }) => {
  
  const [combos, setCombos] = useState<FixedMenuCombo[]>([]);
  const [categorySlots, setCategorySlots] = useState<{ id: string; category: ProductCategory }[]>([]);
  const [currentCombo, setCurrentCombo] = useState<{
    name: string;
    selectedProducts: Record<string, string>;
    comboPrice: number;
  }>({
    name: '',
    selectedProducts: {},
    comboPrice: 0
  });

  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      if (p.isActive) acc[p.category].push(p);
      return acc;
    }, {} as Record<ProductCategory, Product[]>);
  }, [products]);

  const availableCategories = Object.keys(productsByCategory) as ProductCategory[];

  const selectedProductsArray = useMemo(() => {
    return currentCombo.selectedCategories
      .map(category => {
        const productId = currentCombo.selectedProducts[category];
        const product = products.find(p => p.id === productId);
        return product ? { category, product } : null;
      })
      .filter(Boolean) as { category: ProductCategory; product: Product }[];
  }, [currentCombo.selectedCategories, currentCombo.selectedProducts, products]);

  const comboCalculations = useMemo(() => {
    if (selectedProductsArray.length < 2) {
      return {
        totalCost: 0,
        individualPrice: 0,
        comboPrice: currentCombo.comboPrice,
        profit: 0,
        marjaProfit: 0,
        discount: 0,
        discountPercent: 0
      };
    }

    const totalCost = selectedProductsArray.reduce((sum, { product }) => sum + product.pretCost, 0);
    const individualPrice = selectedProductsArray.reduce((sum, { product }) => {
      const price = calculatorType === 'online' ? product.pretOnline : product.pretOffline;
      return sum + price;
    }, 0);
    
    const profit = currentCombo.comboPrice - totalCost;
    const marjaProfit = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    const discount = individualPrice - currentCombo.comboPrice;
    const discountPercent = individualPrice > 0 ? (discount / individualPrice) * 100 : 0;

    return {
      totalCost,
      individualPrice,
      comboPrice: currentCombo.comboPrice,
      profit,
      marjaProfit,
      discount,
      discountPercent
    };
  }, [selectedProductsArray, currentCombo.comboPrice, calculatorType]);

  const handleAddCombo = () => {
    if (currentCombo.selectedCategories.length < 2) {
      alert('Selectează minimum 2 categorii!');
      return;
    }
    if (!currentCombo.name.trim()) {
      alert('Introdu un nume pentru combo!');
      return;
    }
    if (currentCombo.comboPrice <= 0) {
      alert('Setează un preț pentru combo!');
      return;
    }

    const newCombo: FixedMenuCombo = {
      id: `combo-${Date.now()}`,
      name: currentCombo.name,
      products: selectedProductsArray.map(({ category, product }) => ({
        category,
        productId: product.id,
        productName: product.nume
      })),
      totalCost: comboCalculations.totalCost,
      individualPrice: comboCalculations.individualPrice,
      comboPrice: currentCombo.comboPrice,
      profit: comboCalculations.profit,
      marjaProfit: comboCalculations.marjaProfit,
      discount: comboCalculations.discount,
      discountPercent: comboCalculations.discountPercent
    };

    setCombos([...combos, newCombo]);
    
    // Reset form
    setCurrentCombo({
      name: '',
      selectedCategories: [],
      selectedProducts: {} as Record<ProductCategory, string>,
      comboPrice: 0
    });
  };

  const handleDeleteCombo = (comboId: string) => {
    setCombos(combos.filter(c => c.id !== comboId));
  };

  const handleToggleCategory = (category: ProductCategory) => {
    if (currentCombo.selectedCategories.includes(category)) {
      setCurrentCombo({
        ...currentCombo,
        selectedCategories: currentCombo.selectedCategories.filter(c => c !== category),
        selectedProducts: {
          ...currentCombo.selectedProducts,
          [category]: ''
        }
      });
    } else {
      setCurrentCombo({
        ...currentCombo,
        selectedCategories: [...currentCombo.selectedCategories, category]
      });
    }
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
      'ciorbe': 'Ciorbă',
      'fel_Principal': 'Fel Principal',
      'garnituri': 'Garnitură',
      'desert': 'Desert',
      'salate': 'Salată',
      'bauturi': 'Băutură',
      'vinuri': 'Vin',
      'auxiliare': 'Auxiliare',
      'placinte': 'Plăcintă'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h2 className="text-3xl font-black text-black mb-2">🔒 MENIU FIX - BUILDER</h2>
        <p className="text-gray-700 font-semibold">
          Creează combo-uri cu preț fix. Selectează categorii, apoi produse.
        </p>
      </div>

      {/* Combo Builder */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#FFC857]">
        <h3 className="text-2xl font-black text-black mb-6">➕ CREEAZĂ COMBO NOU</h3>
        
        {/* Combo Name */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-black mb-2">Nume Combo:</label>
          <input 
            type="text"
            value={currentCombo.name}
            onChange={(e) => setCurrentCombo({ ...currentCombo, name: e.target.value })}
            placeholder="Ex: Meniu Economic, Combo Tradițional..."
            className="w-full p-4 rounded-xl border-4 border-black text-lg font-bold"
          />
        </div>

        {/* Step 1: Select Categories */}
        <div className="mb-6">
          <h4 className="text-xl font-black text-black mb-4">1️⃣ SELECTEAZĂ CATEGORII (min. 2):</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => handleToggleCategory(category)}
                className={`p-6 rounded-2xl border-4 transition-all ${
                  currentCombo.selectedCategories.includes(category)
                    ? 'bg-[#9eff55] border-black scale-105 shadow-xl'
                    : 'bg-white border-gray-300 hover:border-black'
                }`}
              >
                <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
                <div className="font-black text-black text-sm">{getCategoryName(category)}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {currentCombo.selectedCategories.includes(category) ? '✅' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Products from Each Category */}
        {currentCombo.selectedCategories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xl font-black text-black mb-4">2️⃣ SELECTEAZĂ PRODUSE:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCombo.selectedCategories.map(category => (
                <div key={category}>
                  <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                    <span>{getCategoryIcon(category)}</span>
                    {getCategoryName(category)}:
                  </label>
                  <select
                    value={currentCombo.selectedProducts[category] || ''}
                    onChange={(e) => setCurrentCombo({
                      ...currentCombo,
                      selectedProducts: {
                        ...currentCombo.selectedProducts,
                        [category]: e.target.value
                      }
                    })}
                    className="w-full p-3 rounded-xl border-2 border-black font-bold"
                  >
                    <option value="">-- Selectează --</option>
                    {productsByCategory[category]?.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.nume} ({product.pretCost.toFixed(2)} lei)
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Products Preview */}
        {selectedProductsArray.length > 0 && (
          <div className="mb-6 p-6 rounded-2xl border-4 border-[#BBDCFF] bg-[#BBDCFF]/20">
            <h4 className="font-black text-black mb-4">📋 PRODUSE SELECTATE:</h4>
            <div className="space-y-2">
              {selectedProductsArray.map(({ category, product }) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-black">
                  <span className="font-bold text-black">
                    {getCategoryIcon(category)} {product.nume}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-600">Cost: {product.pretCost.toFixed(2)} lei</p>
                    <p className="text-sm font-bold text-blue-600">
                      Preț: {(calculatorType === 'online' ? product.pretOnline : product.pretOffline).toFixed(2)} lei
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculations */}
        {selectedProductsArray.length >= 2 && (
          <div className="mb-6 p-6 rounded-2xl border-4 border-[#9eff55] bg-[#9eff55]/20">
            <h4 className="font-black text-black mb-4">💰 CALCULE AUTOMATE:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border-2 border-black">
                <p className="text-xs text-gray-600 mb-1">Cost Total:</p>
                <p className="text-2xl font-black text-black">{comboCalculations.totalCost.toFixed(2)} lei</p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-black">
                <p className="text-xs text-gray-600 mb-1">Preț Individual:</p>
                <p className="text-2xl font-black text-blue-600">{comboCalculations.individualPrice.toFixed(2)} lei</p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-black">
                <p className="text-xs text-gray-600 mb-1">Discount Sugerat:</p>
                <p className="text-2xl font-black text-yellow-600">
                  {comboCalculations.discountPercent > 0 ? comboCalculations.discountPercent.toFixed(0) : '0'}%
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-black">
                <p className="text-xs text-gray-600 mb-1">Marjă (la preț combo):</p>
                <p className="text-2xl font-black text-green-600">{comboCalculations.marjaProfit.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Combo Price Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-black mb-2">Preț Combo (LEI):</label>
          <input 
            type="number"
            value={currentCombo.comboPrice || ''}
            onChange={(e) => setCurrentCombo({ ...currentCombo, comboPrice: parseFloat(e.target.value) || 0 })}
            placeholder="Ex: 35"
            min="0"
            step="0.5"
            className="w-full p-4 rounded-xl border-4 border-black text-2xl font-black text-center"
          />
          {comboCalculations.individualPrice > 0 && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Preț individual: {comboCalculations.individualPrice.toFixed(2)} lei | 
              Economie client: {comboCalculations.discount.toFixed(2)} lei ({comboCalculations.discountPercent.toFixed(0)}%)
            </p>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddCombo}
          disabled={selectedProductsArray.length < 2 || !currentCombo.name.trim() || currentCombo.comboPrice <= 0}
          className="w-full p-6 bg-[#9eff55] rounded-2xl border-4 border-black font-black text-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ ADAUGĂ COMBO
        </button>
      </div>

      {/* Saved Combos */}
      {combos.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black text-black mb-6">✅ COMBO-URI SALVATE ({combos.length})</h3>
          <div className="space-y-4">
            {combos.map(combo => (
              <div key={combo.id} className={`p-6 rounded-2xl border-4 ${
                combo.marjaProfit >= 100 ? 'border-green-600 bg-green-50' :
                combo.marjaProfit >= 50 ? 'border-yellow-600 bg-yellow-50' :
                'border-red-600 bg-red-50'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black text-black">{combo.name}</h4>
                    <p className="text-sm text-gray-600">{combo.products.length} produse</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCombo(combo.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                  >
                    🗑️ Șterge
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">PRODUSE:</p>
                    {combo.products.map(p => (
                      <p key={p.productId} className="text-sm font-bold text-black">
                        • {p.productName}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Cost Total:</span>
                      <span className="text-sm font-black">{combo.totalCost.toFixed(2)} lei</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Preț Individual:</span>
                      <span className="text-sm font-black text-blue-600">{combo.individualPrice.toFixed(2)} lei</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Preț Combo:</span>
                      <span className="text-lg font-black text-black">{combo.comboPrice.toFixed(2)} lei</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Economie Client:</span>
                      <span className="text-sm font-black text-green-600">-{combo.discount.toFixed(2)} lei ({combo.discountPercent.toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Profit:</span>
                      <span className="text-sm font-black text-green-600">+{combo.profit.toFixed(2)} lei</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-2 border-black">
                      <span className="text-sm font-bold">Marjă:</span>
                      <span className={`text-lg font-black ${
                        combo.marjaProfit >= 100 ? 'text-green-600' :
                        combo.marjaProfit >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{combo.marjaProfit.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeniuFixBuilder;