'use client';

import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Store, ShoppingCart, Building2, TrendingUp, History, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIngredients } from '@/lib/hooks/useIngredients';
import { useCategories } from '@/lib/hooks/useCategories';
import { useUnits } from '@/lib/hooks/useUnits';
import { Ingredient } from '@/types';
import IngredientPriceHistory from '@/components/foodcost/IngredientPriceHistory';

export default function IngredientsPage() {
  const { t } = useLanguage();
  const companyId = 'default-company'; // This should come from user context
  const { ingredients, loading, error, createIngredient, updateIngredient, deleteIngredient } = useIngredients(companyId);
  const { categories, loading: categoriesLoading } = useCategories(companyId, 'ingredient');
  const { units, loading: unitsLoading } = useUnits(companyId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    unit: 'kg',
    cost_per_unit: 0,
    supplier_id: '',
    purchase_location: '',
    notes: '',
    priceChangeReason: ''
  });

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ingredient.brand && ingredient.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from ingredients
  const ingredientCategories = Array.from(new Set(ingredients.map(ing => ing.category))).filter(Boolean);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      unit: 'kg',
      cost_per_unit: 0,
      supplier_id: '',
      purchase_location: '',
      notes: '',
      priceChangeReason: ''
    });
  };

  const handleOpenAddForm = () => {
    setEditingIngredient(null);
    resetForm();
    setShowAddForm(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      brand: ingredient.brand || '',
      unit: ingredient.unit,
      cost_per_unit: ingredient.cost_per_unit,
      supplier_id: ingredient.supplier_id || '',
      purchase_location: ingredient.purchase_location || '',
      notes: ingredient.notes || '',
      priceChangeReason: ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ingredientData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        unit: formData.unit,
        cost_per_unit: formData.cost_per_unit,
        supplier_id: formData.supplier_id,
        purchase_location: formData.purchase_location,
        notes: formData.notes,
        is_active: true,
        company_id: companyId
      };

      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredientData, formData.priceChangeReason);
      } else {
        await createIngredient(ingredientData);
      }
      
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save ingredient:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('delete-ingredient-confirm' as any) || 'Are you sure you want to delete this ingredient?')) {
      try {
        await deleteIngredient(id);
      } catch (err) {
        console.error('Failed to delete ingredient:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">{t('loading') || 'Loading ingredients...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold">{t('error') || 'Error'}: {error}</p>
      </div>
    );
  }

  // Show price history modal
  if (showPriceHistory) {
    const ingredient = ingredients.find(ing => ing.id === showPriceHistory);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('price-history' as any) || 'Price History'}</h2>
            <button
              onClick={() => setShowPriceHistory(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {ingredient && (
              <IngredientPriceHistory 
                ingredientId={ingredient.id} 
                ingredientName={ingredient.name} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-bold">
                {t('ingredients').toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">{t('ingredients')}</h1>
            <p className="text-green-100 text-sm sm:text-base">
              {t('ingredients-page-desc') || 'Manage your ingredient database and costs with price tracking'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('search-ingredients' as any) || 'Search ingredients...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAddForm}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              {t('add-new') || 'Add New'} {t('ingredient' as any) || 'Ingredient'}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">{t('all-categories' as any) || 'All Categories'}</option>
              {ingredientCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <div className="text-sm text-gray-600">
              {t('showing' as any) || 'Showing'} {filteredIngredients.length} {t('of') || 'of'} {ingredients.length} {t('ingredients') || 'ingredients'}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Grid/Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {ingredients.length === 0 ? (t('no-ingredients-yet') || 'No Ingredients Yet') : (t('no-ingredients-found') || 'No Ingredients Found')}
            </h3>
            <p className="text-gray-500 font-medium mb-4">
              {ingredients.length === 0
                ? (t('no-ingredients-desc') || 'Start by adding your first ingredient to build your database')
                : (t('try-different-search' as any) || 'Try a different search term or category filter')
              }
            </p>
            {ingredients.length === 0 && (
              <button
                onClick={handleOpenAddForm}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                {t('add-first-ingredient') || 'Add First Ingredient'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {filteredIngredients.map((ingredient) => (
                  <div key={ingredient.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-gray-900">{ingredient.name}</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowPriceHistory(ingredient.id)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded transition"
                          title={t('price-history' as any) || 'Price History'}
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditIngredient(ingredient)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(ingredient.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">{t('category') || 'Category'}:</span>
                        <div className="font-medium">{ingredient.category}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('unit') || 'Unit'}:</span>
                        <div className="font-medium">{ingredient.unit}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('cost-per-unit') || 'Cost/Unit'}:</span>
                        <div className="font-bold text-green-600">{ingredient.cost_per_unit.toFixed(2)} RON</div>
                      </div>
                      {ingredient.brand && (
                        <div>
                          <span className="text-gray-600">{t('brand') || 'Brand'}:</span>
                          <div className="font-medium">{ingredient.brand}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">
                      {t('ingredient-name') || 'Ingredient Name'}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">{t('category') || 'Category'}</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">{t('brand') || 'Brand'}</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">
                      {t('unit') || 'Unit'}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">
                      {t('cost-per-unit') || 'Cost/Unit'}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">{t('purchase-location') || 'Location'}</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900">{t('actions') || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3">
                        <div className="font-medium text-gray-900">{ingredient.name}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {ingredient.category}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700">{ingredient.brand || '-'}</td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700">{ingredient.unit}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="font-bold text-green-600">
                          {ingredient.cost_per_unit.toFixed(2)} RON
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700">{ingredient.purchase_location || '-'}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowPriceHistory(ingredient.id)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                            title={t('price-history' as any) || 'Price History'}
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditIngredient(ingredient)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ingredient.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Form Modal - Fixed overlay issue */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">
                {editingIngredient ? (t('edit-ingredient' as any) || 'Edit Ingredient') : (t('add-new-ingredient' as any) || 'Add New Ingredient')}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('basic-information') || 'Basic Information'}
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('ingredient-name') || 'Ingredient Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('ingredient-name') || 'Enter ingredient name'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('category') || 'Category'} *
                    </label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={categoriesLoading}
                    >
                      <option value="">{t('select-category') || 'Select Category'}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.icon ? `${category.icon} ` : ''}{category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <div className="text-xs text-gray-500 mt-1">{t('loading-categories' as any) || 'Loading categories...'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('brand') || 'Brand'}
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder={t('brand-name' as any) || 'Brand name (optional)'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('notes') || 'Notes'}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('additional-notes' as any) || 'Additional notes (optional)'}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Pricing & Purchase Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t('pricing-purchase-info') || 'Pricing & Purchase Info'}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('unit') || 'Unit'} *
                      </label>
                      <select
                        required
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as any }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={unitsLoading}
                      >
                        <option value="">{unitsLoading ? (t('loading') || 'Loading...') : (t('select-unit' as any) || 'Select Unit')}</option>
                        {units.map(unit => (
                          <option key={unit.id} value={unit.abbreviation}>
                            {unit.name} ({unit.abbreviation})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cost-per-unit') || 'Cost per Unit'} (RON) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.cost_per_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('supplier') || 'Supplier'}
                    </label>
                    <input
                      type="text"
                      value={formData.supplier_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                      placeholder={t('supplier-name' as any) || 'Supplier name (optional)'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('purchase-location') || 'Purchase Location'}
                    </label>
                    <select
                      value={formData.purchase_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchase_location: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{t('select-location' as any) || 'Select location (optional)'}</option>
                      <option value="in-store">{t('in-store') || 'In-Store'}</option>
                      <option value="supplier">{t('supplier') || 'Supplier'}</option>
                      <option value="online">{t('online') || 'Online'}</option>
                      <option value="market">{t('market' as any) || 'Market'}</option>
                      <option value="wholesale">{t('wholesale' as any) || 'Wholesale'}</option>
                    </select>
                  </div>

                  {editingIngredient && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('price-change-reason' as any) || 'Reason for Price Change'}
                      </label>
                      <input
                        type="text"
                        value={formData.priceChangeReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceChangeReason: e.target.value }))}
                        placeholder={t('price-change-reason-placeholder' as any) || 'e.g., Market price increase, new supplier, etc.'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
                >
                  {editingIngredient ? (t('update-ingredient' as any) || 'Update Ingredient') : (t('add-ingredient') || 'Add Ingredient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}