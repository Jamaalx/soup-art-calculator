'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  category_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
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
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', editingCategory.id);

      if (error) {
        alert('Error updating category: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{ ...formData, is_active: true }]);

      if (error) {
        alert('Error creating category: ' + error.message);
        return;
      }
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
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:shadow-xl transition"
            style={{ borderLeftWidth: '8px', borderLeftColor: category.color }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">{category.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{category.category_id}</p>
                </div>
              </div>
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: category.color }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Sort Order: <strong>{category.sort_order}</strong></span>
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
        ))}
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
                <label className="block text-sm font-bold mb-2">Category ID</label>
                <input
                  type="text"
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500"
                  placeholder="e.g., desert"
                  disabled={!!editingCategory}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500"
                  placeholder="e.g., Deserturi"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500"
                  placeholder="🍰"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 rounded border-2"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 rounded-lg focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Sort Order</label>
                <input
                  type="number"
                  required
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingCategory ? '💾 Update' : '➕ Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
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