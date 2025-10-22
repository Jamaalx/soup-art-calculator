'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Info } from 'lucide-react';
import { useIngredientPriceHistory, useIngredientPriceInsights } from '@/lib/hooks/useIngredients';
import { useLanguage } from '@/contexts/LanguageContext';

interface IngredientPriceHistoryProps {
  ingredientId: string;
  ingredientName: string;
}

export default function IngredientPriceHistory({ ingredientId, ingredientName }: IngredientPriceHistoryProps) {
  const { t } = useLanguage();
  const { priceHistory, loading: historyLoading } = useIngredientPriceHistory(ingredientId);
  const { insights, loading: insightsLoading } = useIngredientPriceInsights(ingredientId);

  if (historyLoading || insightsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!insights || priceHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {t('no-price-history' as any) || 'No Price History'}
        </h3>
        <p className="text-gray-600">
          {t('no-price-history-desc' as any) || 'Price changes will appear here when you update ingredient costs.'}
        </p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'decreasing':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} RON`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Price Insights Summary */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          {t('price-insights' as any) || 'Price Insights'} - {ingredientName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Price */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">
              {t('current-price' as any) || 'Current Price'}
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(insights.current_price)}
            </div>
          </div>

          {/* Price Trend */}
          <div className={`border rounded-lg p-4 ${getTrendColor(insights.price_trend)}`}>
            <div className="text-sm font-medium mb-1 flex items-center gap-2">
              {getTrendIcon(insights.price_trend)}
              {t('price-trend' as any) || 'Price Trend'}
            </div>
            <div className="text-lg font-bold">
              {t(insights.price_trend as any) || insights.price_trend.charAt(0).toUpperCase() + insights.price_trend.slice(1)}
            </div>
          </div>

          {/* Total Change */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">
              {t('total-change' as any) || 'Total Change'}
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {formatPercent(insights.total_change_percent)}
            </div>
          </div>

          {/* Monthly Average */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">
              {t('monthly-avg' as any) || 'Monthly Avg'}
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {formatPercent(insights.average_monthly_change)}
            </div>
          </div>
        </div>

        {/* High/Low Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">
              {t('highest-price' as any) || 'Highest Price'}
            </div>
            <div className="text-xl font-bold text-red-900">
              {formatCurrency(insights.highest_price.price)}
            </div>
            <div className="text-xs text-red-600">
              {formatDate(insights.highest_price.date)}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">
              {t('lowest-price' as any) || 'Lowest Price'}
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(insights.lowest_price.price)}
            </div>
            <div className="text-xs text-green-600">
              {formatDate(insights.lowest_price.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Price History Timeline */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          {t('price-history' as any) || 'Price History'}
        </h3>

        <div className="space-y-4">
          {priceHistory.map((change, index) => (
            <div key={change.id} className="border-l-4 border-gray-200 pl-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${change.price_change > 0 ? 'bg-red-100' : change.price_change < 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {change.price_change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      ) : change.price_change < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(change.recorded_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t('from' as any) || 'From'}:</span>
                      <span className="font-bold ml-1">{formatCurrency(change.old_price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('to' as any) || 'To'}:</span>
                      <span className="font-bold ml-1">{formatCurrency(change.new_price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('change' as any) || 'Change'}:</span>
                      <span className={`font-bold ml-1 ${change.price_change > 0 ? 'text-red-600' : change.price_change < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatPercent(change.price_change_percent)}
                      </span>
                    </div>
                  </div>

                  {change.change_reason && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">{t('reason' as any) || 'Reason'}:</span> {change.change_reason}
                    </div>
                  )}

                  {(change.purchase_location || change.supplier_id) && (
                    <div className="mt-1 text-xs text-gray-500">
                      {change.purchase_location && (
                        <span>{t('location' as any) || 'Location'}: {change.purchase_location}</span>
                      )}
                      {change.purchase_location && change.supplier_id && ' • '}
                      {change.supplier_id && (
                        <span>{t('supplier') || 'Supplier'}: {change.supplier_id}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}