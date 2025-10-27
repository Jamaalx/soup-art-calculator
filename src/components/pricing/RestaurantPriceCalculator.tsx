'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Utensils, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecipes } from '@/lib/hooks/useRecipes';
import { createClient } from '@/lib/supabase/client';

export default function RestaurantPriceCalculator() {
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch company ID from user profile
  useEffect(() => {
    async function fetchCompanyId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
      }
    }

    fetchCompanyId();
  }, []);

  // Fetch real recipes from database
  const { recipes, loading: recipesLoading } = useRecipes(companyId || '');

  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [profitMargin, setProfitMargin] = useState(100); // Default 100% markup for restaurant
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

    const totalCosts = selectedRecipe.total_cost +
                      additionalCosts.laborCost +
                      additionalCosts.overheadCost +
                      additionalCosts.marketingCost;

    // Calculate selling price based on profit margin (markup percentage)
    const basePrice = totalCosts * (1 + (profitMargin / 100));

    // Calculate food cost percentage
    const foodCostPercent = (selectedRecipe.total_cost / basePrice) * 100;

    setCalculatedPrice(basePrice);
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
            {/* Loading State */}
            {!companyId && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading user profile...</p>
              </div>
            )}

            {/* Recipe Selection */}
            {companyId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipe
                </label>
                <select
                  value={selectedRecipe?.id || ''}
                  onChange={(e) => {
                    const recipe = recipes.find(r => r.id === e.target.value);
                    setSelectedRecipe(recipe || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={recipesLoading}
                >
                  <option value="">
                    {recipesLoading ? 'Loading recipes...' :
                     recipes.length === 0 ? 'No recipes available' :
                     'Choose a recipe...'}
                  </option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} - {recipe.total_cost.toFixed(2)} RON
                    </option>
                  ))}
                </select>
                {!recipesLoading && recipes.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No recipes found. Please create recipes first in the Food Cost section.
                  </p>
                )}
              </div>
            )}

            {selectedRecipe && (
              <>
                {/* Food Cost Display */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2">Recipe Food Cost</h4>
                  <div className="text-3xl font-black text-purple-600">
                    {selectedRecipe.total_cost.toFixed(2)} RON
                  </div>
                  <p className="text-sm text-purple-700">per serving</p>
                </div>

                {/* Profit Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('desired-profit-margin')} (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="40"
                      max="200"
                      step="5"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-20 text-center">
                      <span className="text-2xl font-black text-purple-600">{profitMargin}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>40%</span>
                    <span>120%</span>
                    <span>200%</span>
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
                <h4 className="font-bold text-gray-900 mb-3">Cost Breakdown</h4>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Food Cost</span>
                  <span className="font-bold text-gray-900">
                    {selectedRecipe.total_cost.toFixed(2)} RON
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

                <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg border-2 border-purple-200">
                  <span className="font-bold text-purple-900">Profit Margin ({profitMargin}%)</span>
                  <span className="font-bold text-purple-900">
                    {(calculatedPrice - selectedRecipe.total_cost -
                      additionalCosts.laborCost - additionalCosts.overheadCost -
                      additionalCosts.marketingCost).toFixed(2)} RON
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Percent className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-black text-green-600">
                    {foodCostPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-700 mt-1 font-semibold">
                    Food Cost %
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-blue-600">
                    {(calculatedPrice - selectedRecipe.total_cost -
                      additionalCosts.laborCost - additionalCosts.overheadCost -
                      additionalCosts.marketingCost).toFixed(2)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1 font-semibold">
                    Profit (RON)
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {foodCostPercentage > 35 && (
                    <li>⚠️ Food cost is high. Consider negotiating with suppliers or adjusting portions.</li>
                  )}
                  {foodCostPercentage < 25 && (
                    <li>✅ Excellent food cost ratio! You have good margins.</li>
                  )}
                  {profitMargin < 100 && (
                    <li>💡 Consider increasing your profit margin for better profitability.</li>
                  )}
                  <li>📊 Industry standard: Restaurant food costs typically range from 25-35%.</li>
                </ul>
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