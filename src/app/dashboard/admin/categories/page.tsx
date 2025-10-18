'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Updated interface to match actual database schema
interface Category {
  id: string;
  category_id: string;
  name: string;
  icon: string | null;  // ✅ Allow null
  color: string | null;  // ✅ Allow null
  sort_order: number | null;  // ✅ Allow null
  is_active: boolean;
  created_at?: string;  // Optional fields from database
  updated_at?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    icon: '',
    color: '#000000',
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
      alert('Error loading categories: ' + error.message);
    } else {
      console.log('✅ Loaded categories:', data?.length);
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.name) {
      alert('Please fill all required fields');
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          icon: formData.icon || null,  // Convert empty string to null
          color: formData.color || null,  // Convert empty string to null
          sort_order: formData.sort_order || null  // Convert 0 to null if needed
        })
        .eq('id', editingCategory.id);

      if (error) {
        alert('Error updating category: ' + error.message);
        return;
      }
      alert('✅ Category updated successfully!');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{
          category_id: formData.category_id,
          name: formData.name,
          icon: formData.icon || null,
          color: formData.color || null,
          sort_order: formData.sort_order || null,
          is_active: true
        }]);

      if (error) {
        alert('Error creating category: ' + error.message);
        return;
      }
      alert('✅ Category created successfully!');
    }

    setIsModalOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      category_id: category.category_id,
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#000000',
      sort_order: category.sort_order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      alert('Error deleting category: ' + error.message);
    } else {
      alert('✅ Category deleted successfully!');
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      icon: '',
      color: '#000000',
      sort_order: 0
    });
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Category Management</h1>
            <p className="text-gray-600">Manage product categories, icons, and display order</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
          >
            ➕ Add Category
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Categories</p>
          <p className="text-3xl font-black text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-black text-green-700">{categories.filter(c => c.is_active).length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-md border-2 border-red-200">
          <p className="text-sm text-red-700 mb-1">Inactive</p>
          <p className="text-3xl font-black text-red-700">{categories.filter(c => !c.is_active).length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-md border-2 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Last Sort Order</p>
          <p className="text-3xl font-black text-blue-700">
            {Math.max(...categories.map(c => c.sort_order || 0), 0)}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
            <p className="text-gray-500 text-lg font-bold mb-2">No categories found</p>
            <p className="text-gray-400 text-sm">Click "Add Category" to create your first category</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:shadow-xl transition"
              style={{ borderLeftWidth: '8px', borderLeftColor: category.color || '#000000' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{category.icon || '📦'}</span>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">{category.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{category.category_id}</p>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: category.color || '#000000' }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Sort Order: <strong>{category.sort_order ?? 'N/A'}</strong></span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Category ID *</label>
                <input
                  type="text"
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., desert"
                  disabled={!!editingCategory}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (cannot be changed after creation)</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Deserturi"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="🍰"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">Single emoji recommended</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 rounded border-2 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for category highlights and borders</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {editingCategory ? '💾 Update' : '➕ Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}