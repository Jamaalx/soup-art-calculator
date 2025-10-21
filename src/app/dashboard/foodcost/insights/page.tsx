'use client';

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Percent, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecipeInsights } from '@/lib/hooks/useRecipes';
import Link from 'next/link';

export default function InsightsPage() {
  const { t } = useLanguage();
  const { insights, loading, error } = useRecipeInsights();

  // Use empty state when no data
  const hasData = insights && insights.totalRecipes > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-bold">
                {t('insights').toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">{t('insights')}</h1>
            <p className="text-purple-100 text-sm sm:text-base">
              {t('description') || 'Analyze your food cost patterns and optimize your recipes'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
        </div>
      ) : !hasData ? (
        // Empty State
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 sm:p-12 text-center">
          <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
            {t('no-insights-yet') || 'No Insights Yet'}
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('no-insights-desc') || 'Create recipes with ingredients to start analyzing your food costs and get valuable insights.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/foodcost/ingredients"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              {t('add-ingredients') || 'Add Ingredients'}
            </Link>
            <Link
              href="/dashboard/foodcost"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              {t('create-recipes') || 'Create Recipes'}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <span className="text-green-600 text-xs sm:text-sm font-bold">{t('total') || 'Total'}</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1">
                {insights?.totalRecipes || 0}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                {t('total-recipes') || 'Total Recipes'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="bg-yellow-100 rounded-lg p-2">
                  <Percent className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <span className="text-yellow-600 text-xs sm:text-sm font-bold">{t('average') || 'Average'}</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1">
                {insights?.averageFoodCost?.toFixed(1) || 0}%
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                {t('avg-food-cost-percent') || 'Avg Food Cost %'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="bg-red-100 rounded-lg p-2">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <span className="text-red-600 text-xs sm:text-sm font-bold">{t('highest') || 'Highest'}</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1">
                {insights?.highestCostRecipe ? `${insights.highestCostRecipe.cost} RON` : '0 RON'}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">
                {insights?.highestCostRecipe?.name || t('no-data') || 'No Data'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="bg-green-100 rounded-lg p-2">
                  <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-green-600 text-xs sm:text-sm font-bold">{t('lowest') || 'Lowest'}</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1">
                {insights?.lowestCostRecipe ? `${insights.lowestCostRecipe.cost} RON` : '0 RON'}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">
                {insights?.lowestCostRecipe?.name || t('no-data') || 'No Data'}
              </p>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Cost by Category */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('cost-by-category') || 'Cost by Category'}
              </h3>
              {insights?.costByCategory && insights.costByCategory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {insights.costByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]
                        }}></div>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{category.cost} RON</div>
                        <div className="text-xs sm:text-sm text-gray-500">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">{t('no-category-data') || 'No category data available'}</p>
                </div>
              )}
            </div>

            {/* Most Expensive Ingredients */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('most-expensive-ingredients') || 'Most Expensive Ingredients'}
              </h3>
              {insights?.topExpensiveIngredients && insights.topExpensiveIngredients.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {insights.topExpensiveIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">{ingredient.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">per {ingredient.unit}</div>
                      </div>
                      <div className="font-bold text-red-600 text-sm sm:text-base">
                        {ingredient.costPerUnit} RON
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">{t('no-ingredient-data') || 'No ingredient data available'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('optimization-tips') || 'Optimization Tips'}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">
                  {t('track-ingredient-prices') || 'Track Ingredient Prices'}
                </h4>
                <p className="text-xs sm:text-sm text-blue-800">
                  {t('track-prices-tip') || 'Regularly update ingredient prices to keep your cost calculations accurate and optimize your recipes.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}