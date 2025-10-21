'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Utensils, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Recipe {
  id: string;
  name: string;
  totalCost: number;
  servingSize: number;
  costPerServing: number;
}

// Mock recipes - replace with real data from your service
const mockRecipes: Recipe[] = [
  { id: '1', name: 'Chicken Breast Grilled', totalCost: 15.50, servingSize: 1, costPerServing: 15.50 },
  { id: '2', name: 'Caesar Salad', totalCost: 8.20, servingSize: 1, costPerServing: 8.20 },
  { id: '3', name: 'Pasta Carbonara', totalCost: 12.30, servingSize: 1, costPerServing: 12.30 },
  { id: '4', name: 'Beef Steak Premium', totalCost: 28.90, servingSize: 1, costPerServing: 28.90 },
];

export default function RestaurantPriceCalculator() {
  const { t } = useLanguage();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [profitMargin, setProfitMargin] = useState(65); // Default 65% profit margin for restaurant
  const [additionalCosts, setAdditionalCosts] = useState({
    laborCost: 0,
    overheadCost: 0,
    marketingCost: 0
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [foodCostPercentage, setFoodCostPercentage] = useState(0);

  useEffect(() => {
    if (selectedRecipe) {
      calculatePrice();
    }
  }, [selectedRecipe, profitMargin, additionalCosts]);

  const calculatePrice = () => {
    if (!selectedRecipe) return;

    const totalCosts = selectedRecipe.costPerServing + 
                      additionalCosts.laborCost + 
                      additionalCosts.overheadCost + 
                      additionalCosts.marketingCost;

    // Calculate selling price based on profit margin
    const sellingPrice = totalCosts / (1 - (profitMargin / 100));
    
    // Calculate food cost percentage
    const foodCostPercent = (selectedRecipe.costPerServing / sellingPrice) * 100;

    setCalculatedPrice(sellingPrice);
    setFoodCostPercentage(foodCostPercent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Utensils className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                {t('offline-pricing').toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2">{t('offline-pricing')}</h1>
            <p className="text-purple-100">
              {t('pricing-description')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('price-calculator')}
          </h3>

          <div className="space-y-4">
            {/* Recipe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipe
              </label>
              <select
                value={selectedRecipe?.id || ''}
                onChange={(e) => {
                  const recipe = mockRecipes.find(r => r.id === e.target.value);
                  setSelectedRecipe(recipe || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a recipe...</option>
                {mockRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} - {recipe.costPerServing.toFixed(2)} RON
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipe && (
              <>
                {/* Food Cost Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">Recipe Food Cost</h4>
                  <div className="text-2xl font-black text-blue-600">
                    {selectedRecipe.costPerServing.toFixed(2)} RON
                  </div>
                  <p className="text-sm text-blue-700">per serving</p>
                </div>

                {/* Profit Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('desired-profit-margin')}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>40%</span>
                    <span className="font-bold">{profitMargin}%</span>
                    <span>80%</span>
                  </div>
                </div>

                {/* Additional Costs */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">{t('additional-costs')}</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Cost (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={additionalCosts.laborCost}
                      onChange={(e) => setAdditionalCosts(prev => ({
                        ...prev,
                        laborCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overhead Cost (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={additionalCosts.overheadCost}
                      onChange={(e) => setAdditionalCosts(prev => ({
                        ...prev,
                        overheadCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marketing Cost (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={additionalCosts.marketingCost}
                      onChange={(e) => setAdditionalCosts(prev => ({
                        ...prev,
                        marketingCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('suggested-price')}
          </h3>

          {selectedRecipe ? (
            <div className="space-y-6">
              {/* Main Price Display */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
                <h4 className="text-lg font-bold mb-2">{t('suggested-price')}</h4>
                <div className="text-4xl font-black mb-2">
                  {calculatedPrice.toFixed(2)} RON
                </div>
                <p className="text-purple-100">for restaurant menu</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Cost Breakdown</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Food Cost</span>
                    <span className="font-bold text-gray-900">
                      {selectedRecipe.costPerServing.toFixed(2)} RON
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Labor Cost</span>
                    <span className="font-bold text-gray-900">
                      {additionalCosts.laborCost.toFixed(2)} RON
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Overhead</span>
                    <span className="font-bold text-gray-900">
                      {additionalCosts.overheadCost.toFixed(2)} RON
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Marketing</span>
                    <span className="font-bold text-gray-900">
                      {additionalCosts.marketingCost.toFixed(2)} RON
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded border-2 border-purple-200">
                    <span className="font-bold text-purple-900">Profit Margin ({profitMargin}%)</span>
                    <span className="font-bold text-purple-900">
                      {(calculatedPrice - selectedRecipe.costPerServing - additionalCosts.laborCost - additionalCosts.overheadCost - additionalCosts.marketingCost).toFixed(2)} RON
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Percent className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-green-600">
                    {foodCostPercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-green-700">{t('food-cost-percentage')}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-blue-600">
                    {(calculatedPrice - selectedRecipe.costPerServing - additionalCosts.laborCost - additionalCosts.overheadCost - additionalCosts.marketingCost).toFixed(2)}
                  </div>
                  <p className="text-sm text-blue-700">Profit (RON)</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Recommendations</h4>
                
                {foodCostPercentage > 35 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>High Food Cost:</strong> Your food cost is {foodCostPercentage.toFixed(1)}%. Consider increasing price or reducing ingredient costs.
                    </p>
                  </div>
                )}
                
                {foodCostPercentage < 25 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Great Food Cost:</strong> Your {foodCostPercentage.toFixed(1)}% food cost gives you room for competitive pricing or higher profits.
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Industry Standard:</strong> Restaurant food costs typically range from 25-35% of selling price.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Select a recipe to calculate restaurant pricing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}