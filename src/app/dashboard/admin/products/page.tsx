'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import CompanySelector from '@/components/CompanySelector';

interface Product {
  id: string;
  product_id: string;
  nume: string;
  category_id: string;
  cantitate: string | null;
  pret_cost: number;
  pret_offline: number | null;
  pret_online: number | null;
  is_active: boolean;
  user_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  category_id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export default function ProductsPage() {
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
    if (!selectedCompanyId) return;

    // Fetch company template categories (no user_id)
    const { data, error } = await supabase
      .from('categories')
      .select('category_id, name, icon, color')
      .eq('company_id', selectedCompanyId)
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
    
    // Fetch company template products (no user_id)
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
      console.log('✅ Loaded products:', data?.length);
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
      // UPDATE
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
      alert('✅ Product updated successfully!');
    } else {
      // INSERT - Create template product for company
      const { error } = await supabase
        .from('products')
        .insert({
          product_id: formData.product_id,
          nume: formData.nume,
          category_id: formData.category_id,
          cantitate: formData.cantitate || null,
          pret_cost: Number(formData.pret_cost),
          pret_offline: formData.pret_offline ? Number(formData.pret_offline) : null,
          pret_online: formData.pret_online ? Number(formData.pret_online) : null,
          is_active: true,
          user_id: null, // Template product (no user)
          company_id: selectedCompanyId
        });

      if (error) {
        alert('Error creating product: ' + error.message);
        console.error('Insert error:', error);
        return;
      }
      alert('✅ Product created successfully!');
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
    if (!confirm('Are you sure you want to delete this product? This will affect all users in this company.')) return;

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      alert('✅ Product deleted successfully!');
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Product Templates</h1>
                <p className="text-gray-600">Manage company product templates (shared with all users)</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
              >
                ➕ Add Product
              </button>
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
                <p className="text-gray-500 text-lg font-bold mb-2">No products found</p>
                <p className="text-gray-400 text-sm">
                  {selectedCategory === 'all' 
                    ? 'Click "Add Product" to create your first product template'
                    : 'Try adjusting your filters or add a new product'}
                </p>
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
                  <label className="block text-xs font-bold mb-2 text-red-600">Cost</label>
                  <input
                    type="number"
                    step="0.01"
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
                  💡 This is a template product. All users assigned to this company will receive a copy.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {editingProduct ? '💾 Update' : '➕ Create'}
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