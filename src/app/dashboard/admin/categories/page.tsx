'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/database';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    icon: '',
    color: '#000000',
    sort_order: 0
  });

  useEffect(() => {
    checkAdminAndInit();
  }, []);

  const checkAdminAndInit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in');
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
    fetchCategories();
  };

  const fetchCategories = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('user_id', null)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
      alert('Error loading categories: ' + error.message);
    } else {
      console.log('✅ Loaded template categories:', data?.length);
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
          icon: formData.icon || null,
          color: formData.color || null,
          sort_order: formData.sort_order || null
        })
        .eq('id', editingCategory.id);

      if (error) {
        alert('Error updating category: ' + error.message);
        return;
      }
      alert('✅ Category template updated successfully!');
    } else {
      const categoryData: CategoryInsert = {
        category_id: formData.category_id,
        name: formData.name,
        icon: formData.icon || null,
        color: formData.color || null,
        sort_order: formData.sort_order || null,
        is_active: true,
        user_id: null
      };

      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) {
        alert('Error creating category template: ' + error.message);
        return;
      }
      alert('✅ Category template created successfully!');
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
    if (!confirm('Are you sure you want to delete this template category? This will affect all future user assignments.')) return;

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      alert('Error deleting category: ' + error.message);
    } else {
      alert('✅ Category template deleted successfully!');
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

  if (loading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">ADMIN</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">TEMPLATES</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Category Templates</h1>
            <p className="text-white/90">Manage global category templates (shared across all users)</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition"
          >
            ➕ Add Template
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-black text-blue-900 mb-1">About Category Templates</h3>
            <p className="text-sm text-blue-800">
              These are <strong>global templates</strong> that can be assigned to any user. When you assign templates to a user, 
              they get their own editable copy. Changes here won't affect categories already assigned to users.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Templates</p>
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
        <div className="bg-purple-50 rounded-xl p-4 shadow-md border-2 border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Highest Sort Order</p>
          <p className="text-3xl font-black text-purple-700">
            {Math.max(...categories.map(c => c.sort_order || 0), 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-gray-500 text-lg font-bold mb-2">No category templates found</p>
            <p className="text-gray-400 text-sm mb-4">Click "Add Template" to create your first category template</p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
            >
              ➕ Create First Template
            </button>
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

              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">
                    🌍 GLOBAL TEMPLATE
                  </span>
                  <span className="text-gray-500">Unassigned</span>
                </div>
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

      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 mt-6">
        <h2 className="text-xl font-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/admin/users/assign')}
            className="p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-black text-gray-900">Assign to Users</h3>
                <p className="text-sm text-gray-600">Copy these templates to specific users</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/admin/products')}
            className="p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <h3 className="font-black text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-600">Create product templates for users</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black mb-6">
              {editingCategory ? 'Edit Category Template' : 'Add New Category Template'}
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

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  💡 This is a <strong>global template</strong>. It can be assigned to any user through the User Assignment page.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
                >
                  {editingCategory ? '💾 Update Template' : '➕ Create Template'}
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