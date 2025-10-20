'use client';

import React, { useState, useMemo } from 'react';
import type { Product, FixedMenuCombo } from '@/types';
import { getCategoryIcon, getCategoryLabel, getCategoryColor } from '@/lib/data/categories';

interface CategorySlot {
  id: string;
  category: string;
}

interface MeniuFixBuilderProps {
  products: Product[];
  calculatorType: 'online' | 'offline' | 'catering';
  onMenuUpdate?: (data: { 
    type: 'fix'; 
    combos: FixedMenuCombo[]; 
    selectedCombo?: FixedMenuCombo 
  }) => void;
}

const MeniuFixBuilder: React.FC<MeniuFixBuilderProps> = ({ 
  products, 
  calculatorType,
  onMenuUpdate
}) => {
  
  const [combos, setCombos] = useState<FixedMenuCombo[]>([]);
  const [categorySlots, setCategorySlots] = useState<CategorySlot[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>({});
  const [comboName, setComboName] = useState<string>('');
  const [comboPrice, setComboPrice] = useState<number>(35);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Online costs
  const AMBALAJ_COST = 3.0;
  const APP_COMMISSION = 0.363;

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

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    availableCategories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.is_active);
    });
    return grouped;
  }, [products, availableCategories]);

  const handleAddCategory = (category: string) => {
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
    }).filter(Boolean) as Array<{ slotId: string; category: string; product: Product }>;
  }, [categorySlots, selectedProducts, products]);

  const comboCalculations = useMemo(() => {
    if (selectedProductsArray.length < 2) {
      return {
        foodCost: 0,
        totalCost: 0,
        individualPrice: 0,
        comboPrice: comboPrice,
        priceAfterDiscount: comboPrice,
        discountAmount: 0,
        commissionAmount: 0,
        profit: 0,
        marjaProfit: 0,
        customerDiscount: 0,
        customerDiscountPercent: 0
      };
    }

    // Food cost
    const foodCost = selectedProductsArray.reduce((sum, { product }) => 
      sum + product.pret_cost, 0);
    
    // Price after discount (what customer actually pays)
    const discountAmount = (comboPrice * discountPercent) / 100;
    const priceAfterDiscount = comboPrice - discountAmount;
    
    // Commission is calculated on price after discount
    let commissionAmount = 0;
    let totalCost = foodCost;
    
    if (calculatorType === 'online') {
      commissionAmount = priceAfterDiscount * APP_COMMISSION;
      totalCost = foodCost + AMBALAJ_COST + commissionAmount;
    }
    
    // Individual price (sum of products sold separately)
    const individualPrice = selectedProductsArray.reduce((sum, { product }) => {
      const price = calculatorType === 'online' 
        ? (product.pret_online || 0) 
        : (product.pret_offline || 0);
      return sum + price;
    }, 0);
    
    // Profit = what customer pays - total costs
    const profit = priceAfterDiscount - totalCost;
    const marjaProfit = (profit / totalCost) * 100;
    
    // Customer discount (how much they save vs buying separately)
    const customerDiscount = individualPrice - priceAfterDiscount;
    const customerDiscountPercent = (customerDiscount / individualPrice) * 100;

    return {
      foodCost,
      totalCost,
      individualPrice,
      comboPrice,
      priceAfterDiscount,
      discountAmount,
      commissionAmount,
      profit,
      marjaProfit,
      customerDiscount,
      customerDiscountPercent
    };
  }, [selectedProductsArray, comboPrice, discountPercent, calculatorType]);

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

    const updatedCombos = [...combos, newCombo];
    setCombos(updatedCombos);
    
    // Notify parent component
    if (onMenuUpdate) {
      onMenuUpdate({
        type: 'fix',
        combos: updatedCombos,
        selectedCombo: newCombo
      });
    }
    
    // Reset form
    setCategorySlots([]);
    setSelectedProducts({});
    setComboName('');
    setComboPrice(35);
    setDiscountPercent(0);
  };

  const handleDeleteCombo = (comboId: string) => {
    const updatedCombos = combos.filter(c => c.id !== comboId);
    setCombos(updatedCombos);
    
    // Notify parent component
    if (onMenuUpdate) {
      onMenuUpdate({
        type: 'fix',
        combos: updatedCombos,
        selectedCombo: updatedCombos.length > 0 ? updatedCombos[updatedCombos.length - 1] : undefined
      });
    }
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
            const count = productsByCategory[category]?.length || 0;
            const icon = getCategoryIcon(category);
            const label = getCategoryLabel(category);
            const color = getCategoryColor(category);
            
            return (
              <button
                key={category}
                onClick={() => handleAddCategory(category)}
                disabled={count === 0}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-4 border-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-black text-black text-center">
                  {label}
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
                const icon = getCategoryIcon(slot.category);
                const label = getCategoryLabel(slot.category);
                const color = getCategoryColor(slot.category);
                
                return (
                  <div 
                    key={slot.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-black"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs font-black text-black">
                      #{index + 1} {label}
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
              const categoryProducts = productsByCategory[slot.category] || [];
              const icon = getCategoryIcon(slot.category);
              const label = getCategoryLabel(slot.category);
              const color = getCategoryColor(slot.category);

              return (
                <div key={slot.id} className="p-4 rounded-2xl border-2 border-black" style={{ backgroundColor: `${color}40` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-black text-black">
                      #{index + 1} {label}
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
                        {product.nume} - {product.pret_cost.toFixed(2)} lei
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
            💰 PASUL 3: CONFIGUREAZĂ COMBO-UL
          </h3>

          {/* Combo Name */}
          <div className="mb-6">
            <label className="block text-sm font-black text-black mb-2">
              NUMELE COMBO-ULUI
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
              PREȚ BAZĂ COMBO: {comboPrice.toFixed(2)} LEI
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

          {/* Discount Slider (Online only) */}
          {calculatorType === 'online' && (
            <div className="mb-6">
              <label className="block text-sm font-black text-black mb-2">
                🎁 DISCOUNT PROMOȚIONAL: {discountPercent.toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                className="w-full h-4 bg-red-300 rounded-lg cursor-pointer border-2 border-black"
              />
              <div className="flex justify-between text-xs font-bold text-black mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
              {discountPercent > 0 && (
                <p className="text-xs font-bold text-red-600 mt-2">
                  Client plătește: {comboCalculations.priceAfterDiscount.toFixed(2)} LEI 
                  (economie: {comboCalculations.discountAmount.toFixed(2)} LEI)
                </p>
              )}
            </div>
          )}

          {/* Selected Products Preview */}
          <div className="mb-6 p-4 bg-blue-100 rounded-2xl border-2 border-black">
            <p className="text-sm font-black text-black mb-2">PRODUSE SELECTATE:</p>
            {selectedProductsArray.map(({ category, product }, index) => (
              <p key={index} className="text-xs font-bold text-black">
                • {getCategoryLabel(category)}: {product.nume} ({product.pret_cost.toFixed(2)} lei)
              </p>
            ))}
          </div>

          {/* Cost Breakdown (Online) */}
          {calculatorType === 'online' && (
            <div className="mb-6 p-4 bg-purple-100 rounded-2xl border-2 border-black">
              <p className="text-sm font-black text-black mb-2">💸 DETALII COSTURI:</p>
              <p className="text-xs font-bold text-black">• Cost mâncare: {comboCalculations.foodCost.toFixed(2)} LEI</p>
              <p className="text-xs font-bold text-black">• Ambalaj: {AMBALAJ_COST.toFixed(2)} LEI</p>
              <p className="text-xs font-bold text-black">
                • Comision app ({(APP_COMMISSION * 100).toFixed(1)}% din {comboCalculations.priceAfterDiscount.toFixed(2)} LEI): {comboCalculations.commissionAmount.toFixed(2)} LEI
              </p>
              <p className="text-xs font-black text-black mt-2 pt-2 border-t-2 border-black">
                TOTAL COSTURI: {comboCalculations.totalCost.toFixed(2)} LEI
              </p>
            </div>
          )}

          {/* Calculations */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 rounded-2xl border-2 border-black bg-yellow-200">
              <p className="text-xs font-black text-black">COST TOTAL</p>
              <p className="text-2xl font-black text-black">{comboCalculations.totalCost.toFixed(2)} LEI</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-blue-200">
              <p className="text-xs font-black text-black">PREȚ INDIVIDUAL</p>
              <p className="text-2xl font-black text-blue-600">{comboCalculations.individualPrice.toFixed(2)} LEI</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-orange-200">
              <p className="text-xs font-black text-black">CLIENT PLĂTEȘTE</p>
              <p className="text-2xl font-black text-black">{comboCalculations.priceAfterDiscount.toFixed(2)} LEI</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-black bg-green-200">
              <p className="text-xs font-black text-black">PROFIT NET</p>
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

          {/* Customer Discount Info */}
          <div className="p-4 bg-green-100 rounded-2xl border-2 border-black mb-6">
            <p className="text-sm font-black text-black">
              🎉 ECONOMIE CLIENT (vs prețuri individuale): {comboCalculations.customerDiscount.toFixed(2)} LEI 
              ({comboCalculations.customerDiscountPercent.toFixed(1)}%)
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

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">COST</p>
                    <p className="text-lg font-black text-black">{combo.totalCost.toFixed(2)} LEI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">INDIVIDUAL</p>
                    <p className="text-lg font-black text-blue-600">{combo.individualPrice.toFixed(2)} LEI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">PREȚ CLIENT</p>
                    <p className="text-lg font-black text-black">{combo.priceAfterDiscount.toFixed(2)} LEI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-800">PROFIT NET</p>
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
                    <p className="text-xs font-bold text-gray-800">ECONOMIE</p>
                    <p className="text-lg font-black text-green-600">{combo.customerDiscountPercent.toFixed(1)}%</p>
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