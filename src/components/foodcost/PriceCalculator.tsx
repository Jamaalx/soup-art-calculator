'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Target, Store, Truck, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PriceCalculatorProps {
  costPerServing: number;
  totalCost: number;
  servings: number;
}

export default function PriceCalculator({ costPerServing, totalCost, servings }: PriceCalculatorProps) {
  const { t } = useLanguage();
  const [targetMargin, setTargetMargin] = useState(35);
  const [sellingChannel, setSellingChannel] = useState<'restaurant' | 'delivery'>('restaurant');
  
  // Restaurant pricing calculations
  const restaurantOverheadRate = 0.25; // 25% overhead (labor, utilities, rent)
  const restaurantMinMargin = 30; // 30% minimum margin
  const restaurantTargetMargin = 40; // 40% target margin

  // Delivery pricing calculations  
  const deliveryCommission = 0.15; // 15% delivery platform commission
  const deliveryMinMargin = 25; // 25% minimum margin (lower due to volume)
  const deliveryTargetMargin = 35; // 35% target margin

  const calculatePrice = (margin: number, isDelivery: boolean = false) => {
    let adjustedCost = costPerServing;
    
    if (!isDelivery) {
      // Restaurant pricing includes overhead
      adjustedCost = costPerServing * (1 + restaurantOverheadRate);
    }
    
    // Calculate base price for desired margin
    let basePrice = adjustedCost / (1 - margin / 100);
    
    if (isDelivery) {
      // Add delivery commission to final price
      basePrice = basePrice / (1 - deliveryCommission);
    }
    
    return basePrice;
  };

  const restaurantMinPrice = calculatePrice(restaurantMinMargin, false);
  const restaurantTargetPrice = calculatePrice(restaurantTargetMargin, false);
  const restaurantCustomPrice = calculatePrice(targetMargin, false);

  const deliveryMinPrice = calculatePrice(deliveryMinMargin, true);
  const deliveryTargetPrice = calculatePrice(deliveryTargetMargin, true);
  const deliveryCustomPrice = calculatePrice(targetMargin, true);

  const currentPrice = sellingChannel === 'restaurant' ? restaurantCustomPrice : deliveryCustomPrice;
  const actualMargin = sellingChannel === 'restaurant' 
    ? ((currentPrice - costPerServing * (1 + restaurantOverheadRate)) / currentPrice) * 100
    : ((currentPrice * (1 - deliveryCommission) - costPerServing) / (currentPrice * (1 - deliveryCommission))) * 100;

  const formatPrice = (price: number) => `${price.toFixed(2)} RON`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">
          {t('recommended-price-calculator') || 'Recommended Price Calculator'}
        </h3>
      </div>

      {/* Channel Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('selling-channel') || 'Selling Channel'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSellingChannel('restaurant')}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
              sellingChannel === 'restaurant'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">{t('restaurant') || 'Restaurant'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSellingChannel('delivery')}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
              sellingChannel === 'delivery'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="font-medium">{t('delivery') || 'Delivery'}</span>
          </button>
        </div>
      </div>

      {/* Custom Margin Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('target-profit-margin') || 'Target Profit Margin'}: {formatPercent(targetMargin)}
        </label>
        <input
          type="range"
          min="15"
          max="60"
          value={targetMargin}
          onChange={(e) => setTargetMargin(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>15%</span>
          <span>60%</span>
        </div>
      </div>

      {/* Price Recommendations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5" />
          {t('price-recommendations') || 'Price Recommendations'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Minimum Price */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">
              {t('minimum-price') || 'Minimum Price'}
            </div>
            <div className="text-xl font-bold text-red-900">
              {formatPrice(sellingChannel === 'restaurant' ? restaurantMinPrice : deliveryMinPrice)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {formatPercent(sellingChannel === 'restaurant' ? restaurantMinMargin : deliveryMinMargin)} {t('margin') || 'margin'}
            </div>
          </div>

          {/* Target Price */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">
              {t('recommended-price') || 'Recommended Price'}
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatPrice(sellingChannel === 'restaurant' ? restaurantTargetPrice : deliveryTargetPrice)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {formatPercent(sellingChannel === 'restaurant' ? restaurantTargetMargin : deliveryTargetMargin)} {t('margin') || 'margin'}
            </div>
          </div>

          {/* Custom Price */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">
              {t('your-target') || 'Your Target'}
            </div>
            <div className="text-xl font-bold text-blue-900">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {formatPercent(actualMargin)} {t('actual-margin') || 'actual margin'}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          {t('cost-breakdown') || 'Cost Breakdown'}
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('food-cost-per-serving') || 'Food Cost per Serving'}:</span>
            <span className="font-medium">{formatPrice(costPerServing)}</span>
          </div>
          
          {sellingChannel === 'restaurant' && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('overhead-costs') || 'Overhead Costs'} ({formatPercent(restaurantOverheadRate * 100)}):</span>
              <span className="font-medium">{formatPrice(costPerServing * restaurantOverheadRate)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('total-cost') || 'Total Cost'}:</span>
            <span className="font-medium">
              {formatPrice(sellingChannel === 'restaurant' 
                ? costPerServing * (1 + restaurantOverheadRate) 
                : costPerServing
              )}
            </span>
          </div>
          
          {sellingChannel === 'delivery' && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('delivery-commission') || 'Platform Commission'} ({formatPercent(deliveryCommission * 100)}):</span>
              <span className="font-medium text-red-600">-{formatPrice(currentPrice * deliveryCommission)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-bold">
            <span className="text-gray-900">{t('profit-per-serving') || 'Profit per Serving'}:</span>
            <span className="text-green-600">
              {formatPrice(
                sellingChannel === 'restaurant'
                  ? currentPrice - costPerServing * (1 + restaurantOverheadRate)
                  : currentPrice * (1 - deliveryCommission) - costPerServing
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">{t('pricing-tips') || 'Pricing Tips'}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('tip-market-research') || 'Research competitor prices in your area'}</li>
          <li>• {t('tip-test-pricing') || 'Test different price points with small batches'}</li>
          <li>• {t('tip-track-margins') || 'Track actual margins and adjust as needed'}</li>
          <li>• {t('tip-seasonal-adjust') || 'Consider seasonal ingredient cost changes'}</li>
        </ul>
      </div>
    </div>
  );
}