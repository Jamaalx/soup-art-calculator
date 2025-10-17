'use client';

import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory, FixedMenuCombo } from '@/types';
import { CATEGORIES, getCategoryIcon, getCategoryLabel } from '@/lib/data/categories';

interface CategorySlot {
  id: string;
  category: ProductCategory;
}

interface MeniuFixBuilderProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
}

const MeniuFixBuilder: React.FC<MeniuFixBuilderProps> = ({ products, calculatorType }) => {
  
  const [combos, setCombos] = useState<FixedMenuCombo[]>([]);
  const [categorySlots, setCategorySlots] = useState<CategorySlot[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>({});
  const [comboName, setComboName] = useState<string>('');
  const [comboPrice, setComboPrice] = useState<number>(35);

  // Online: 3 lei packaging + 36.3% commission
  // Offline/Catering: No extra costs
  const COSTURI_FIXE = calculatorType === 'online' ? 0 : 0; // Will add dynamically in calculations

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
      category 
    }]);
  };

  const handleRemoveSlot = (slotId: string) => {
    setCategorySlots(prev => prev.filter(s => s.id !== slotId));
    setSelectedProducts(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  const handleProductSelect = (slotId: string, productId: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [slotId]: productId
    }));
  };

  const selectedProductsArray = useMemo(() => {
    return categorySlots.map(slot => {
      const productId = selectedProducts[slot.id];
      if (!productId) return null;
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return { slotId: slot.id, category: slot.category, product };
    }).filter(Boolean) as Array<{ slotId: string; category: ProductCategory; product: Product }>;
  }, [categorySlots, selectedProducts, products]);

  const comboCalculations = useMemo(() => {
    if (selectedProductsArray.length < 2) {
      return {
        totalCost: 0,
        individualPrice: 0,
        comboPrice: comboPrice,
        profit: 0,
        marjaProfit: 0,
        discount: 0,
        discountPercent: 0
      };
    }

    const totalCost = selectedProductsArray.reduce((sum, { product }) => 
      sum + product.pretCost, 0) + COSTURI_FIXE;
    
    const individualPrice = selectedProductsArray.reduce((sum, { product }) => 
      sum + (calculatorType === 'online' ? product.pretOnline : product.pretOffline), 0);
    
    const profit = comboPrice - totalCost;
    const marjaProfit = (profit / totalCost) * 100;
    const discount = individualPrice - comboPrice;
    const discountPercent = (discount / individualPrice) * 100;

    return {
      totalCost,
      individualPrice,
      comboPrice,
      profit,
      marjaProfit,
      discount,
      discountPercent
    };
  }, [selectedProductsArray, comboPrice, calculatorType, COSTURI_FIXE]);

  const handleSaveCombo = () => {
    if (selectedProductsArray.length < 2 || !comboName.trim()) {
      alert('Te rog adaugă minimum 2 produse și un nume pentru combo!');
      return;
    }

    const newCombo: FixedMenuCombo = {
      id: `combo-${Date.now()}`,
      name: comboName,
      products: selectedProductsArray.map(({ category, product }) => ({
        category,
        productId: product.id,
        productName: product.nume
      })),
      ...comboCalculations
    };

    setCombos(prev => [...prev, newCombo]);
    
    // Reset form
    setCategorySlots([]);
    setSelectedProducts({});
    setComboName('');
    setComboPrice(35);
  };

  const handleDeleteCombo = (comboId: string) => {
    setCombos(prev => prev.filter(c => c.id !== comboId));
  };

  return (
    <div className="space-y-6">
      
      {/* Step 1: Add Categories */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          📋 PASUL 1: ADAUGĂ CATEGORII
        </h3>
        <p className="text-sm font-bold text-gray-700 mb-4">
          Selectează categoriile pentru combo (minimum 2)
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
              CATEGORII ADĂUGATE ({categorySlots.length})
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
                      #{index + 1} {categoryInfo.label}
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

      {/* Step 2: Select Products */}
      {categorySlots.length >= 2 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black mb-4 text-black">
            🎯 PASUL 2: SELECTEAZĂ PRODUSELE
          </h3>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Alege câte un produs din fiecare categorie
          </p>

          <div className="space-y-4">
            {categorySlots.map((slot, index) => {
              const categoryInfo = CATEGORIES[slot.category];
              const categoryProducts = productsByCategory[slot.category] || [];

              return (
                <div key={slot.id} className="p-4 rounded-2xl border-2 border-black" style={{ backgroundColor: `${categoryInfo.color}40` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <span className="text-sm font-black text-black">
                      #{index + 1} {categoryInfo.label}
                    </span>
                  </div>
                  
                  <select
                    value={selectedProducts[slot.id] || ''}
                    onChange={(e) => handleProductSelect(slot.id, e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-black font-bold text-black bg-white"
                  >
                    <option value="">Selectează produs...</option>
                    {categoryProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.nume} - {product.pretCost.toFixed(2)} lei
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Combo Configuration */}
      {selectedProductsArray.length >= 2 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black mb-4 text-black">
            💰 PASUL 3: CONFIGUREAZĂ COMBOBOX-UL
          </h3>

          {/* Combo Name */}
          <div className="mb-6">
            <label className="block text-sm font-black text-black mb-2">
              NUMELE COMBOULUI
            </label>
            <input
              type="text"
              value={comboName}
              onChange={(e) => setComboName(e.target.value)}
              placeholder="Ex: Meniu Tradițional"
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>

          {/* Price Slider */}
          <div className="mb-6">
            <label className="block text-sm font-black text-black mb-2">
              PREȚ COMBO: {comboPrice.toFixed(2)} LEI
            </label>
            <input
              type="range"
              min="20"
              max="80"
              step="0.5"
              value={comboPrice}
              onChange={(e) => setComboPrice(parseFloat(e.target.value))}
              className="w-full h-4 bg-yellow-300 rounded-lg cursor-pointer border-2 border-black"
            />
            <div className="flex justify-between text-xs font-bold text-black mt-1">
              <span>20 LEI</span>
              <span>80 LEI</span>
            </div>
          </div>

          {/* Selected Products Preview */}
          <div className="mb-6 p-4 bg-blue-100 rounded-2xl border-2 border-black">
            <p className="text-sm font-black text-black mb-2">PRODUSE SELECTATE:</p>
            {selectedProductsArray.map(({ category, product }, index) => (
              <p key={index} className="text-xs font-bold text-black">
                • {getCategoryLabel(category)}: {product.nume} ({product.pretCost.toFixed(2)} lei)
              </p>
            ))}
          </div>

          {/* Calculations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl border-2 border-black bg-yellow-200">
              <p className="text-xs font-black text-black">COST TOTAL</p>
              <p className="text-2xl font-black text-black">{comboCalculations.totalCost.toFixed(2)} LEI</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-blue-200">
              <p className="text-xs font-black text-black">PREȚ INDIVIDUAL</p>
              <p className="text-2xl font-black text-black">{comboCalculations.individualPrice.toFixed(2)} LEI</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-green-200">
              <p className="text-xs font-black text-black">PROFIT</p>
              <p className={`text-2xl font-black ${comboCalculations.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comboCalculations.profit >= 0 ? '+' : ''}{comboCalculations.profit.toFixed(2)} LEI
              </p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-purple-200">
              <p className="text-xs font-black text-black">MARJĂ</p>
              <p className={`text-2xl font-black ${comboCalculations.marjaProfit >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                {comboCalculations.marjaProfit.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Discount Info */}
          <div className="p-4 bg-green-100 rounded-2xl border-2 border-black mb-6">
            <p className="text-sm font-black text-black">
              🎉 DISCOUNT PENTRU CLIENT: {comboCalculations.discount.toFixed(2)} LEI 
              ({comboCalculations.discountPercent.toFixed(1)}%)
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCombo}
            disabled={!comboName.trim() || selectedProductsArray.length < 2}
            className="w-full py-4 bg-green-500 text-white rounded-2xl border-4 border-black font-black text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💾 SALVEAZĂ COMBO
          </button>
        </div>
      )}

      {/* Saved Combos */}
      {combos.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h3 className="text-2xl font-black mb-4 text-black">
            📦 COMBO-URI SALVATE ({combos.length})
          </h3>

          <div className="space-y-4">
            {combos.map((combo) => (
              <div 
                key={combo.id}
                className={`p-6 rounded-2xl border-4 border-black ${
                  combo.marjaProfit >= 100 ? 'bg-green-200' :
                  combo.marjaProfit >= 50 ? 'bg-yellow-200' : 'bg-red-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-black mb-2">{combo.name}</h4>
                    <p className="text-xs font-bold text-gray-800">
                      {combo.products.length} produse
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCombo(combo.id)}
                    className="px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-red-600"
                  >
                    🗑️ ȘTERGE
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">PREȚ COMBO</p>
                    <p className="text-lg font-black text-black">{combo.comboPrice.toFixed(2)} LEI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">COST</p>
                    <p className="text-lg font-black text-black">{combo.totalCost.toFixed(2)} LEI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">PROFIT</p>
                    <p className={`text-lg font-black ${combo.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {combo.profit >= 0 ? '+' : ''}{combo.profit.toFixed(2)} LEI
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">MARJĂ</p>
                    <p className={`text-lg font-black ${combo.marjaProfit >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {combo.marjaProfit.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">DISCOUNT</p>
                    <p className="text-lg font-black text-green-600">{combo.discountPercent.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {combo.products.map((item, index) => (
                    <p key={index} className="text-xs font-bold text-black">
                      • {getCategoryLabel(item.category)}: {item.productName}
                    </p>
                  ))}
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