'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeIngredient, Ingredient } from '@/types';
import { useIngredients } from '@/lib/hooks/useRecipes';
import { useCategories } from '@/lib/hooks/useCategories';
import { Plus, Minus, Search, Calculator, Clock, Users, DollarSign } from 'lucide-react';
import PriceCalculator from './PriceCalculator';

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RecipeForm({ recipe, onSave, onCancel, loading = false }: RecipeFormProps) {
  const { ingredients } = useIngredients();
  const { categories, loading: categoriesLoading } = useCategories('default-company', 'recipe');
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    category: recipe?.category || '',
    preparation_time: recipe?.preparation_time || 30,
    servings: recipe?.servings || 1,
    is_active: recipe?.is_active ?? true
  });

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients || []
  );

  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalCost = recipeIngredients.reduce((sum, ing) => sum + ing.cost, 0);
  const costPerServing = totalCost / formData.servings;

  const addIngredient = () => {
    const ingredient = ingredients.find(i => i.id === selectedIngredient);
    if (!ingredient || quantity <= 0) return;

    const cost = (quantity * ingredient.cost_per_unit);
    const newIngredient: RecipeIngredient = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity,
      unit: ingredient.unit,
      cost
    };

    setRecipeIngredients([...recipeIngredients, newIngredient]);
    setSelectedIngredient('');
    setQuantity(0);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateIngredientQuantity = (index: number, newQuantity: number) => {
    const ingredient = ingredients.find(i => i.id === recipeIngredients[index].ingredient_id);
    if (!ingredient) return;

    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      quantity: newQuantity,
      cost: newQuantity * ingredient.cost_per_unit
    };
    setRecipeIngredients(updatedIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      serving_size: formData.servings, // Map servings to serving_size
      ingredients: recipeIngredients,
      total_cost: totalCost,
      cost_per_serving: costPerServing,
      company_id: '' // Will be set by service
    };

    await onSave(recipeData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <h2 className="text-2xl font-black mb-2">
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </h2>
        <p className="text-green-100">
          Build detailed recipes with accurate cost calculations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Recipe Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                placeholder="e.g., Ciorbă de burtă tradițională"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select Category'}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon ? `${category.icon} ` : ''}{category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                rows={3}
                placeholder="Brief description of the recipe..."
              />
            </div>

            {/* Recipe Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Servings
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* User Guidance */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">Next Steps</h4>
              <p className="text-sm text-blue-800 mb-2">
                After creating this recipe, use the <strong>Pricing Calculator</strong> to determine selling prices.
              </p>
              <p className="text-xs text-blue-600">
                Go to: Pricing → Restaurant Calculator or Delivery Calculator
              </p>
            </div>
          </div>

          {/* Right Column - Ingredients */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900">Recipe Ingredients</h3>

            {/* Add Ingredient */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">Add Ingredient</h4>
              
              {/* Search Ingredients */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Select Ingredient */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select ingredient</option>
                  {filteredIngredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.cost_per_unit} LEI/{ingredient.unit})
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={!selectedIngredient || quantity <= 0}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              {recipeIngredients.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No ingredients added yet</p>
                  <p className="text-sm">Add ingredients to calculate costs</p>
                </div>
              ) : (
                recipeIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{ingredient.ingredient_name}</p>
                      <p className="text-sm text-gray-600">
                        {ingredient.quantity} {ingredient.unit} × {
                          ingredients.find(i => i.id === ingredient.ingredient_id)?.cost_per_unit || 0
                        } LEI = {ingredient.cost.toFixed(2)} LEI
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredientQuantity(index, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h3 className="text-base sm:text-lg font-black text-gray-900">Food Cost Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Recipe Cost</p>
              <p className="text-3xl font-black text-gray-900">{totalCost.toFixed(2)} RON</p>
              <p className="text-xs text-gray-500">for {formData.servings} servings</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Cost per Serving</p>
              <p className="text-3xl font-black text-green-600">{costPerServing.toFixed(2)} RON</p>
              <p className="text-xs text-gray-500">use this for pricing calculations</p>
            </div>
          </div>

        </div>

        {/* Price Calculator - Only show if we have ingredients */}
        {recipeIngredients.length > 0 && (
          <div className="mt-6">
            <PriceCalculator 
              costPerServing={costPerServing}
              totalCost={totalCost}
              servings={formData.servings}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="submit"
            disabled={loading || recipeIngredients.length === 0}
            className="flex-1 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {loading ? 'Saving...' : (recipe ? 'Update Recipe' : 'Create Recipe')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition text-sm sm:text-base sm:min-w-[120px]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}