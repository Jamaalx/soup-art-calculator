'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Truck, DollarSign, Percent, TrendingUp, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecipes } from '@/lib/hooks/useRecipes';
import { useDeliveryPlatforms } from '@/hooks/useDeliveryPlatforms';
import { createClient } from '@/lib/supabase/client';

interface PlatformSettings {
  id: string;
  platform: string;
  commission: number;
  packagingCost: number;
  processingCost: number;
  color?: string;
}

export default function OnlineDeliveryCalculator() {
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const supabase = createClient();

  // Use the new delivery platforms hook
  const { platforms: deliveryPlatforms, loading: loadingPlatforms, error: platformsError } = useDeliveryPlatforms();

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch company ID
  useEffect(() => {
    async function fetchData() {
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

    fetchData();
  }, []);

  // Convert delivery platforms to platform settings format
  useEffect(() => {
    if (!loadingPlatforms && deliveryPlatforms.length > 0) {
      const mappedPlatforms: PlatformSettings[] = deliveryPlatforms.map(platform => ({
        id: platform.id,
        platform: platform.platform_name,
        commission: platform.commission_rate,
        packagingCost: 2.50, // Default values - could be made configurable
        processingCost: 1.00,
        color: platform.platform_color
      }));

      setPlatformSettings(mappedPlatforms);
      setLoadingSettings(false);
    } else if (!loadingPlatforms) {
      setLoadingSettings(false);
    }
  }, [deliveryPlatforms, loadingPlatforms]);

  const { recipes, loading: recipesLoading } = useRecipes(companyId || '');
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSettings | null>(null);
  const [profitMargin, setProfitMargin] = useState(50);

  const [customCosts, setCustomCosts] = useState({
    packagingCost: 2.50,
    processingCost: 1.00
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [netPrice, setNetPrice] = useState(0);
  const [foodCostPercentage, setFoodCostPercentage] = useState(0);

  useEffect(() => {
    if (platformSettings.length > 0 && !selectedPlatform) {
      setSelectedPlatform(platformSettings[0]);
      setCustomCosts({
        packagingCost: platformSettings[0].packagingCost,
        processingCost: platformSettings[0].processingCost
      });
    }
  }, [platformSettings]);

  useEffect(() => {
    if (selectedPlatform) {
      setCustomCosts({
        packagingCost: selectedPlatform.packagingCost,
        processingCost: selectedPlatform.processingCost
      });
    }
  }, [selectedPlatform]);

  useEffect(() => {
    if (selectedRecipe && selectedPlatform) {
      calculatePrice();
    }
  }, [selectedRecipe, selectedPlatform, profitMargin, customCosts]);

  const calculatePrice = () => {
    if (!selectedRecipe || !selectedPlatform) return;

    const totalCosts = selectedRecipe.total_cost +
                      customCosts.packagingCost +
                      customCosts.processingCost;

    const basePrice = totalCosts / (1 - (profitMargin / 100));
    const finalPrice = basePrice / (1 - (selectedPlatform.commission / 100));
    const netPriceAfterCommission = finalPrice * (1 - (selectedPlatform.commission / 100));
    const foodCostPercent = (selectedRecipe.total_cost / finalPrice) * 100;

    setCalculatedPrice(finalPrice);
    setNetPrice(netPriceAfterCommission);
    setFoodCostPercentage(foodCostPercent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                {t('online-pricing').toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2">{t('online-pricing')}</h1>
            <p className="text-green-100">
              Calculate prices for online delivery platforms including commissions and packaging
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
            {(!companyId || loadingSettings) && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading platform settings...</p>
              </div>
            )}

            {/* Error State */}
            {platformsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {platformsError}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loadingSettings && platformSettings.length === 0 && !platformsError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>No platforms configured.</strong> Please contact your administrator to set up delivery platforms.
                </p>
              </div>
            )}

            {companyId && !loadingSettings && platformSettings.length > 0 && (
              <>
                {/* Recipe Selection */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Platform
                  </label>
                  <select
                    value={selectedPlatform?.id || ''}
                    onChange={(e) => {
                      const platform = platformSettings.find(p => p.id === e.target.value);
                      setSelectedPlatform(platform || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {platformSettings.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.platform} ({platform.commission}% commission)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {selectedRecipe && selectedPlatform && (
              <>
                {/* Food Cost Display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">Recipe Food Cost</h4>
                  <div className="text-3xl font-black text-green-600">
                    {selectedRecipe.total_cost.toFixed(2)} RON
                  </div>
                  <p className="text-sm text-green-700">per serving</p>
                </div>

                {/* Profit Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('desired-profit-margin')}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>30%</span>
                    <span className="font-bold">{profitMargin}%</span>
                    <span>70%</span>
                  </div>
                </div>

                {/* Delivery Costs */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Delivery & Processing Costs</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packaging Cost (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={customCosts.packagingCost}
                      onChange={(e) => setCustomCosts(prev => ({
                        ...prev,
                        packagingCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Cost (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={customCosts.processingCost}
                      onChange={(e) => setCustomCosts(prev => ({
                        ...prev,
                        processingCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Platform Commission:</strong> {selectedPlatform.commission}% will be deducted by {selectedPlatform.platform}
                    </p>
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
            Pricing Results
          </h3>

          {selectedRecipe && selectedPlatform ? (
            <div className="space-y-6">
              {/* Customer Price */}
              <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
                <h4 className="font-bold mb-2">Customer Pays</h4>
                <div className="text-5xl font-black mb-2">
                  {calculatedPrice.toFixed(2)} RON
                </div>
                <p className="text-green-100 text-sm">on {selectedPlatform.platform}</p>
              </div>

              {/* Net Revenue */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white">
                <h4 className="font-bold mb-2">You Receive</h4>
                <div className="text-5xl font-black mb-2">
                  {netPrice.toFixed(2)} RON
                </div>
                <p className="text-purple-100 text-sm">after {selectedPlatform.commission}% commission</p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Cost Breakdown</h4>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Food Cost</span>
                  <span className="font-bold text-gray-900">
                    {selectedRecipe.total_cost.toFixed(2)} RON
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Packaging</span>
                  <span className="font-bold text-gray-900">
                    {customCosts.packagingCost.toFixed(2)} RON
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Processing</span>
                  <span className="font-bold text-gray-900">
                    {customCosts.processingCost.toFixed(2)} RON
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-red-100 rounded border border-red-200">
                  <span className="text-sm text-red-700">{selectedPlatform.platform} Commission</span>
                  <span className="font-bold text-red-700">
                    -{(calculatedPrice - netPrice).toFixed(2)} RON
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200">
                  <span className="font-bold text-green-900">Your Profit</span>
                  <span className="font-bold text-green-900">
                    {(netPrice - selectedRecipe.total_cost - customCosts.packagingCost - customCosts.processingCost).toFixed(2)} RON
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <Percent className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-green-600">
                    {foodCostPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-700 mt-1 font-semibold">
                    Food Cost %
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-blue-600">
                    {(netPrice - selectedRecipe.total_cost - customCosts.packagingCost - customCosts.processingCost).toFixed(2)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1 font-semibold">
                    Profit (RON)
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Recommendations</h4>
                
                {foodCostPercentage > 40 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>High Food Cost:</strong> {foodCostPercentage.toFixed(1)}% is high for delivery. Consider optimizing recipe or increasing price.
                    </p>
                  </div>
                )}
                
                {foodCostPercentage < 30 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Good Food Cost:</strong> {foodCostPercentage.toFixed(1)}% allows for competitive pricing in the delivery market.
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Delivery Tip:</strong> Online food costs should be 25-35% of final customer price due to platform commissions.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Select a recipe to calculate online delivery pricing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}