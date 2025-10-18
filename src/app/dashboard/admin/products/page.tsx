'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import CompanySelector from '@/components/CompanySelector';
import type { Database } from '@/lib/supabase/database';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    product_id: '',
    nume: '',
    category_id: '',
    cantitate: '',
    pret_cost: 0,
    pret_offline: 0,
    pret_online: 0
  });

  useEffect(() => {
    checkAdminAndInit();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCategories();
      fetchProducts();
    }
  }, [selectedCompanyId]);

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
    setLoading(false);
  };

  const fetchCategories = async () => {
    // Fetch global template categories (no user_id)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('user_id', null)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchProducts = async () => {
    if (!selectedCompanyId) return;
    
    setLoading(true);
    
    // Fetch company template products (user_id = null, company_id = selected)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', selectedCompanyId)
      .is('user_id', null)
      .order('nume');

    if (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products: ' + error.message);
    } else {
      console.log('✅ Loaded template products:', data?.length);
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      alert('Please select a company first');
      return;
    }

    if (!formData.product_id || !formData.nume || !formData.category_id) {
      alert('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      // UPDATE existing template
      const { error } = await supabase
        .from('products')
        .update({
          nume: formData.nume,
          category_id: formData.category_id,
          cantitate: formData.cantitate || null,
          pret_cost: Number(formData.pret_cost),
          pret_offline: formData.pret_offline ? Number(formData.pret_offline) : null,
          pret_online: formData.pret_online ? Number(formData.pret_online) : null
        })
        .eq('id', editingProduct.id);

      if (error) {
        alert('Error updating product: ' + error.message);
        return;
      }
      alert('✅ Product template updated successfully!');
    } else {
      // INSERT new template
      const productData: ProductInsert = {
        product_id: formData.product_id,
        nume: formData.nume,
        category_id: formData.category_id,
        cantitate: formData.cantitate || null,
        pret_cost: Number(formData.pret_cost),
        pret_offline: formData.pret_offline ? Number(formData.pret_offline) : null,
        pret_online: formData.pret_online ? Number(formData.pret_online) : null,
        is_active: true,
        user_id: null,  // Template (no user assigned)
        company_id: selectedCompanyId
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        alert('Error creating product template: ' + error.message);
        console.error('Insert error:', error);
        return;
      }
      alert('✅ Product template created successfully!');
    }

    setIsModalOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id,
      nume: product.nume,
      category_id: product.category_id,
      cantitate: product.cantitate || '',
      pret_cost: product.pret_cost || 0,
      pret_offline: product.pret_offline || 0,
      pret_online: product.pret_online || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template product? This will affect all future user assignments.')) return;

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      alert('✅ Product template deleted successfully!');
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      nume: '',
      category_id: '',
      cantitate: '',
      pret_cost: 0,
      pret_offline: 0,
      pret_online: 0
    });
    setEditingProduct(null);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.category_id === categoryId);
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
      {/* Company Selector */}
      <CompanySelector 
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={setSelectedCompanyId}
      />

      {selectedCompanyId && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 mb-6 text-white mt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">ADMIN</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">TEMPLATES</span>
                </div>
                <h1 className="text-3xl font-black mb-2">Product Templates</h1>
                <p className="text-white/90">Manage company product templates (shared with company users)</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition"
              >
                ➕ Add Template
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-black text-blue-900 mb-1">About Product Templates</h3>
                <p className="text-sm text-blue-800">
                  These are <strong>company templates</strong> that can be assigned to users in this company. When you assign templates to a user, 
                  they get their own editable copy with their own prices. Changes here won't affect products already assigned to users.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Templates</p>
              <p className="text-3xl font-black text-gray-900">{products.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
              <p className="text-sm text-green-700 mb-1">Active</p>
              <p className="text-3xl font-black text-green-700">{products.filter(p => p.is_active).length}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-md border-2 border-red-200">
              <p className="text-sm text-red-700 mb-1">Inactive</p>
              <p className="text-3xl font-black text-red-700">{products.filter(p => !p.is_active).length}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-md border-2 border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Categories Used</p>
              <p className="text-3xl font-black text-blue-700">
                {new Set(products.map(p => p.category_id)).size}
              </p>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-gray-200">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-bold transition ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.category_id}
                    onClick={() => setSelectedCategory(cat.category_id)}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      selectedCategory === cat.category_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat.icon || '📦'} {cat.name} ({products.filter(p => p.category_id === cat.category_id).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
                <span className="text-6xl mb-4 block">📦</span>
                <p className="text-gray-500 text-lg font-bold mb-2">No product templates found</p>
                <p className="text-gray-400 text-sm mb-4">
                  {selectedCategory === 'all' 
                    ? 'Click "Add Template" to create your first product template'
                    : 'No products in this category. Try another filter or add a new product.'}
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  ➕ Create First Template
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const category = getCategoryInfo(product.category_id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:shadow-xl transition"
                    style={{ borderLeftWidth: '8px', borderLeftColor: category?.color || '#000' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{category?.icon || '📦'}</span>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg">{product.nume}</h3>
                          <p className="text-xs text-gray-500 font-mono">{product.product_id}</p>
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: category?.color || '#000' }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Quantity: <strong>{product.cantitate || 'N/A'}</strong></span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-bold text-red-600">{product.pret_cost?.toFixed(2) || '0.00'} lei</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Offline:</span>
                        <span className="font-bold text-blue-600">{product.pret_offline?.toFixed(2) || '0.00'} lei</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Online:</span>
                        <span className="font-bold text-green-600">{product.pret_online?.toFixed(2) || '0.00'} lei</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                          🏢 COMPANY TEMPLATE
                        </span>
                        <span className="text-gray-500">Unassigned</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 mt-6">
            <h2 className="text-xl font-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard/admin/users/assign')}
                className="p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition text-left"
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
                onClick={() => router.push('/dashboard/admin/categories')}
                className="p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏷️</span>
                  <div>
                    <h3 className="font-black text-gray-900">Manage Categories</h3>
                    <p className="text-sm text-gray-600">Create category templates for products</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-black mb-6">
              {editingProduct ? 'Edit Product Template' : 'Add New Product Template'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Product ID *</label>
                <input
                  type="text"
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., ciorba-burta"
                  disabled={!!editingProduct}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (cannot be changed after creation)</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.nume}
                  onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Ciorbă de burtă"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Category *</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon || '📦'} {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {categories.length === 0 && 'No categories available. Create categories first.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Quantity</label>
                <input
                  type="text"
                  value={formData.cantitate}
                  onChange={(e) => setFormData({ ...formData, cantitate: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., 400ml or 200gr"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-2 text-red-600">Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pret_cost}
                    onChange={(e) => setFormData({ ...formData, pret_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-blue-600">Offline</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pret_offline}
                    onChange={(e) => setFormData({ ...formData, pret_offline: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-green-600">Online</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pret_online}
                    onChange={(e) => setFormData({ ...formData, pret_online: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 This is a <strong>company template</strong>. Users in this company will receive copies when assigned. Each user can then customize their own prices.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {editingProduct ? '💾 Update Template' : '➕ Create Template'}
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