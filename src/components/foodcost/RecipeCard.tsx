'use client';

import { Recipe } from '@/types';
import { 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Link2,
  ChefHat,
  Target
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onLink?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete, onLink }: RecipeCardProps) {
  const getProfitabilityColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600 bg-green-100';
    if (margin >= 15) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProfitabilityLabel = (margin: number) => {
    if (margin >= 30) return 'Excellent';
    if (margin >= 15) return 'Good';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-black mb-1">{recipe.name}</h3>
            <p className="text-green-100 text-sm capitalize">{recipe.category}</p>
          </div>
          <div className="flex items-center gap-2">
            {recipe.product_id && (
              <div className="p-1 bg-white/20 rounded">
                <Link2 className="w-4 h-4" />
              </div>
            )}
            <ChefHat className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{recipe.preparation_time} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{recipe.servings} servings</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Cost:</span>
            <span className="font-bold text-gray-900">{recipe.total_cost.toFixed(2)} LEI</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cost per Serving:</span>
            <span className="font-bold text-gray-900">{recipe.cost_per_serving.toFixed(2)} LEI</span>
          </div>
          {recipe.selling_price && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Selling Price:</span>
              <span className="font-bold text-gray-900">{recipe.selling_price.toFixed(2)} LEI</span>
            </div>
          )}
        </div>

        {/* Profitability */}
        {recipe.selling_price && recipe.profit_margin !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Profitability:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getProfitabilityColor(recipe.profit_margin)}`}>
                {getProfitabilityLabel(recipe.profit_margin)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    recipe.profit_margin >= 30 ? 'bg-green-500' :
                    recipe.profit_margin >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(recipe.profit_margin, 100)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900">
                {recipe.profit_margin.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Ingredients Count */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ingredients:</span>
            <span className="font-bold text-gray-900">{recipe.ingredients.length} items</span>
          </div>
        </div>

        {/* Key Ingredients Preview */}
        {recipe.ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Key Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                >
                  {ingredient.ingredient_name}
                </span>
              ))}
              {recipe.ingredients.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                  +{recipe.ingredients.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(recipe)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          {onLink && !recipe.product_id && (
            <button
              onClick={() => onLink(recipe)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition text-sm"
            >
              <Link2 className="w-4 h-4" />
              Link
            </button>
          )}

          <button
            onClick={() => onDelete(recipe.id)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {recipe.product_id && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
            <Target className="w-3 h-3" />
            <span>Linked to product</span>
          </div>
        )}
      </div>
    </div>
  );
}