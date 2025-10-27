'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Store, ShoppingCart, Building2, TrendingUp, History, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserSettings';
import { useIngredients } from '@/lib/hooks/useIngredients';
import { useCategories } from '@/lib/hooks/useCategories';
import { useUnits } from '@/lib/hooks/useUnits';
import { Ingredient } from '@/types';
import IngredientPriceHistory from '@/components/foodcost/IngredientPriceHistory';

export default function IngredientsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const companyId = profile?.company_id || '';

  const { ingredients, loading, error, createIngredient, updateIngredient, deleteIngredient } = useIngredients(companyId);
  const { categories, loading: categoriesLoading } = useCategories(companyId, 'ingredient');
  const { units, loading: unitsLoading } = useUnits(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    brand: string;
    unit: 'kg' | 'l' | 'piece' | 'g' | 'ml';
    cost_per_unit: number;
    supplier_id: string;
    purchase_location: string;
    notes: string;
    priceChangeReason: string;
  }>({
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

  // Get unique categories from ingredients (for filter dropdown)
  const uniqueCategories = Array.from(new Set(ingredients.map(ing => ing.category))).filter(Boolean);

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
    if (confirm(t('delete-ingredient-confirm') || 'Are you sure you want to delete this ingredient?')) {
      try {
        await deleteIngredient(id);
      } catch (err) {
        console.error('Failed to delete ingredient:', err);
      }
    }
  };

  if (profileLoading || loading) {
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-red-600">
          <p className="text-xl font-bold mb-2">Error Loading Ingredients</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              {t('ingredients') || 'Ingredients Library'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t('ingredients-description') || 'Manage your ingredient inventory and costs'}
            </p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            {t('add-ingredient') || 'Add Ingredient'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search-ingredients') || 'Search ingredients...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">{t('all-categories') || 'All Categories'}</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-gray-600">
              {t('showing') || 'Showing'} {filteredIngredients.length} {t('of') || 'of'} {ingredients.length} {t('ingredients') || 'ingredients'}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Grid */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('no-ingredients') || 'No Ingredients Found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? t('no-matching-ingredients') || 'Try adjusting your search or filters'
              : t('add-first-ingredient') || 'Add your first ingredient to get started'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
            >
              <Plus className="w-5 h-5" />
              {t('add-ingredient') || 'Add Ingredient'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-green-400 transition p-6 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-green-600 transition">
                    {ingredient.name}
                  </h3>
                  <p className="text-sm text-gray-600">{ingredient.category}</p>
                  {ingredient.brand && (
                    <p className="text-xs text-gray-500 mt-1">Brand: {ingredient.brand}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditIngredient(ingredient)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title={t('edit') || 'Edit'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ingredient.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title={t('delete') || 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Cost per {ingredient.unit}</span>
                  <span className="font-black text-green-600 text-lg">{ingredient.cost_per_unit.toFixed(2)} RON</span>
                </div>

                {ingredient.supplier_id && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Store className="w-4 h-4" />
                    <span>{ingredient.supplier_id}</span>
                  </div>
                )}

                {ingredient.purchase_location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="capitalize">{ingredient.purchase_location.replace('-', ' ')}</span>
                  </div>
                )}

                <button
                  onClick={() => setShowPriceHistory(ingredient.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold text-gray-700"
                >
                  <History className="w-4 h-4" />
                  {t('price-history') || 'Price History'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900">
                {t('price-history') || 'Price History'}
              </h2>
              <button
                onClick={() => setShowPriceHistory(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <IngredientPriceHistory ingredientId={showPriceHistory} companyId={companyId} />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    {editingIngredient ? (t('edit-ingredient') || 'Edit Ingredient') : (t('add-new-ingredient') || 'Add New Ingredient')}
                  </h2>
                  <p className="text-green-100 text-sm">
                    {editingIngredient ? (t('update-ingredient-details') || 'Update ingredient details and track price changes') : (t('fill-ingredient-details') || 'Fill in the details below to add a new ingredient')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('basic-info') || 'Basic Information'}
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
                      <option value="">{categoriesLoading ? (t('loading') || 'Loading...') : (t('select-category') || 'Select Category')}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.icon ? `${category.icon} ` : ''}{category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <div className="text-xs text-gray-500 mt-1">{t('loading-categories') || 'Loading categories...'}</div>
                    )}
                    {!categoriesLoading && categories.length === 0 && (
                      <div className="text-xs text-yellow-600 mt-1">{t('no-categories') || 'No categories available. Please contact admin.'}</div>
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
                      placeholder={t('brand-name') || 'Brand name (optional)'}
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
                      placeholder={t('additional-notes') || 'Additional notes (optional)'}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as 'kg' | 'l' | 'piece' | 'g' | 'ml' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={unitsLoading}
                      >
                        <option value="">{unitsLoading ? (t('loading') || 'Loading...') : (t('select-unit') || 'Select Unit')}</option>
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
                      placeholder={t('supplier-name') || 'Supplier name (optional)'}
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
                      <option value="">{t('select-location') || 'Select location (optional)'}</option>
                      <option value="in-store">{t('in-store') || 'In-Store'}</option>
                      <option value="supplier">{t('supplier') || 'Supplier'}</option>
                      <option value="online">{t('online') || 'Online'}</option>
                      <option value="market">{t('market') || 'Market'}</option>
                      <option value="wholesale">{t('wholesale') || 'Wholesale'}</option>
                    </select>
                  </div>

                  {editingIngredient && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('price-change-reason') || 'Reason for Price Change'}
                      </label>
                      <input
                        type="text"
                        value={formData.priceChangeReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceChangeReason: e.target.value }))}
                        placeholder={t('price-change-reason-placeholder') || 'e.g., Market price increase, new supplier, etc.'}
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
                  {editingIngredient ? (t('update-ingredient') || 'Update Ingredient') : (t('add-ingredient') || 'Add Ingredient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}