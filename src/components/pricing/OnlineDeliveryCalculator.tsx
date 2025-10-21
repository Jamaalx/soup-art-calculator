'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Truck, DollarSign, Percent, TrendingUp, Package } from 'lucide-react';
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

const platforms = [
  { id: 'foodpanda', name: 'Foodpanda', commission: 15 },
  { id: 'glovo', name: 'Glovo', commission: 17 },
  { id: 'uber', name: 'Uber Eats', commission: 18 },
  { id: 'tazz', name: 'Tazz', commission: 16 },
];

export default function OnlineDeliveryCalculator() {
  const { t } = useLanguage();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [profitMargin, setProfitMargin] = useState(50); // Lower profit margin for online due to competition
  
  const [deliveryCosts, setDeliveryCosts] = useState({
    packagingCost: 2.50,
    deliveryFee: 0, // Usually handled by platform
    processingCost: 1.00
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [netPrice, setNetPrice] = useState(0); // Price after platform commission
  const [foodCostPercentage, setFoodCostPercentage] = useState(0);

  useEffect(() => {
    if (selectedRecipe) {
      calculatePrice();
    }
  }, [selectedRecipe, selectedPlatform, profitMargin, deliveryCosts]);

  const calculatePrice = () => {
    if (!selectedRecipe) return;

    const totalCosts = selectedRecipe.costPerServing + 
                      deliveryCosts.packagingCost + 
                      deliveryCosts.processingCost;

    // Calculate selling price based on profit margin
    const basePrice = totalCosts / (1 - (profitMargin / 100));
    
    // Add platform commission to get final price
    const finalPrice = basePrice / (1 - (selectedPlatform.commission / 100));
    
    // Calculate net price (what restaurant receives)
    const netPriceAfterCommission = finalPrice * (1 - (selectedPlatform.commission / 100));
    
    // Calculate food cost percentage based on final price
    const foodCostPercent = (selectedRecipe.costPerServing / finalPrice) * 100;

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a recipe...</option>
                {mockRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} - {recipe.costPerServing.toFixed(2)} RON
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Platform
              </label>
              <select
                value={selectedPlatform.id}
                onChange={(e) => {
                  const platform = platforms.find(p => p.id === e.target.value);
                  if (platform) setSelectedPlatform(platform);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name} ({platform.commission}% commission)
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
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">Delivery & Processing Costs</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('packaging-cost')} (RON)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliveryCosts.packagingCost}
                      onChange={(e) => setDeliveryCosts(prev => ({
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
                      value={deliveryCosts.processingCost}
                      onChange={(e) => setDeliveryCosts(prev => ({
                        ...prev,
                        processingCost: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Platform Commission:</strong> {selectedPlatform.commission}% will be deducted by {selectedPlatform.name}
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

          {selectedRecipe ? (
            <div className="space-y-6">
              {/* Main Price Display */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white text-center">
                <h4 className="text-lg font-bold mb-2">Customer Pays</h4>
                <div className="text-4xl font-black mb-2">
                  {calculatedPrice.toFixed(2)} RON
                </div>
                <p className="text-green-100">on {selectedPlatform.name}</p>
              </div>

              {/* Net Price Display */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white text-center">
                <h4 className="text-lg font-bold mb-2">You Receive</h4>
                <div className="text-3xl font-black mb-2">
                  {netPrice.toFixed(2)} RON
                </div>
                <p className="text-purple-100">after {selectedPlatform.commission}% commission</p>
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
                    <span className="text-sm text-gray-700">{t('packaging-cost')}</span>
                    <span className="font-bold text-gray-900">
                      {deliveryCosts.packagingCost.toFixed(2)} RON
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Processing</span>
                    <span className="font-bold text-gray-900">
                      {deliveryCosts.processingCost.toFixed(2)} RON
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-red-100 rounded border border-red-200">
                    <span className="text-sm text-red-700">{selectedPlatform.name} Commission</span>
                    <span className="font-bold text-red-700">
                      -{(calculatedPrice - netPrice).toFixed(2)} RON
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-green-100 rounded border-2 border-green-200">
                    <span className="font-bold text-green-900">Your Profit</span>
                    <span className="font-bold text-green-900">
                      {(netPrice - selectedRecipe.costPerServing - deliveryCosts.packagingCost - deliveryCosts.processingCost).toFixed(2)} RON
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
                    {((netPrice - selectedRecipe.costPerServing - deliveryCosts.packagingCost - deliveryCosts.processingCost) / netPrice * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-blue-700">Net Profit Margin</p>
                </div>
              </div>

              {/* Platform Comparison */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Platform Comparison</h4>
                <div className="space-y-2">
                  {platforms.map((platform) => {
                    const platformPrice = calculatedPrice / (1 - (selectedPlatform.commission / 100)) * (1 - (platform.commission / 100));
                    const isSelected = platform.id === selectedPlatform.id;
                    
                    return (
                      <div key={platform.id} className={`flex justify-between items-center p-2 rounded ${
                        isSelected ? 'bg-green-100 border border-green-200' : 'bg-gray-50'
                      }`}>
                        <span className={`text-sm ${isSelected ? 'text-green-900 font-bold' : 'text-gray-700'}`}>
                          {platform.name} ({platform.commission}%)
                        </span>
                        <span className={`font-bold ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                          {platformPrice.toFixed(2)} RON
                        </span>
                      </div>
                    );
                  })}
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