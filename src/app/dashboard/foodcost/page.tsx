'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  ChefHat,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserSettings';
import { useRecipes, useRecipeInsights } from '@/lib/hooks/useRecipes';
import { Recipe } from '@/types';
import RecipeCard from '@/components/foodcost/RecipeCard';
import RecipeForm from '@/components/foodcost/RecipeForm';

export default function FoodCostPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const companyId = profile?.company_id || '';

  const { recipes, loading, error, createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { insights } = useRecipeInsights();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(recipes.map(r => r.category))).filter(Boolean);

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createRecipe(recipeData);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create recipe:', err);
    }
  };

  const handleUpdateRecipe = async (recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingRecipe) return;
    
    try {
      await updateRecipe(editingRecipe.id, recipeData);
      setEditingRecipe(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update recipe:', err);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDeleteRecipe = async (id: string) => {
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        await deleteRecipe(id);
      } catch (err) {
        console.error('Failed to delete recipe:', err);
      }
    }
  };

  if (showForm) {
    return (
      <RecipeForm
        recipe={editingRecipe || undefined}
        companyId={companyId}
        onSave={editingRecipe ? handleUpdateRecipe : handleCreateRecipe}
        onCancel={() => {
          setShowForm(false);
          setEditingRecipe(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ChefHat className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">FOODCOST</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Recipe Management</h1>
            <p className="text-green-100">
              Create detailed recipes with accurate cost calculations and ingredient tracking
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Recipe
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ChefHat className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Recipes</p>
            <p className="text-3xl font-black text-gray-900">{insights.totalRecipes}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Food Cost</p>
            <p className="text-3xl font-black text-gray-900">{insights.averageFoodCost.toFixed(2)} LEI</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Most Profitable</p>
            <p className="text-lg font-black text-gray-900 truncate">
              {insights.mostProfitable?.name || 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Needs Review</p>
            <p className="text-3xl font-black text-gray-900">
              {recipes.filter(r => !r.selling_price || (r.profit_margin || 0) < 15).length}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/foodcost/ingredients"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Manage Ingredients</h3>
              <p className="text-sm text-gray-600">Add and update ingredient costs</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/foodcost/insights"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Recipe Insights</h3>
              <p className="text-sm text-gray-600">Analyze recipe performance</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/pricing"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Calculate Prices</h3>
              <p className="text-sm text-gray-600">Set optimal menu pricing</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredRecipes.length} of {recipes.length} recipes</span>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-gray-200 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">
            {recipes.length === 0 ? 'No Recipes Yet' : 'No Recipes Found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {recipes.length === 0 
              ? 'Create your first recipe to start calculating food costs'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {recipes.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create First Recipe
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-blue-900 mb-2">Recipe Cost Management Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Keep ingredient costs updated for accurate calculations</li>
              <li>• Aim for 25-35% food cost ratio for healthy profit margins</li>
              <li>• Link recipes to menu products for automatic cost updates</li>
              <li>• Review recipe profitability regularly and adjust pricing</li>
              <li>• Track preparation time to calculate labor costs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}