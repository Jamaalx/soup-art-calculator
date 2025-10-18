'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  product_id: string;
  nume: string;
  category_id: string;  // Back to category_id
  cantitate: string;
  pret_cost: number;
  pret_offline: number;
  pret_online: number;
  is_active: boolean;
}

interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('category_id, name, icon, color')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, product_id, nume, category_id, cantitate, pret_cost, pret_offline, pret_online, is_active, user_id')
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

    if (!formData.product_id || !formData.nume || !formData.category_id) {
      alert('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          nume: formData.nume,
          category_id: formData.category_id,
          cantitate: formData.cantitate,
          pret_cost: formData.pret_cost,
          pret_offline: formData.pret_offline,
          pret_online: formData.pret_online
        })
        .eq('id', editingProduct.id);

      if (error) {
        alert('Error updating product: ' + error.message);
        return;
      }
      alert('✅ Product updated successfully!');
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{ ...formData, is_active: true }]);

      if (error) {
        alert('Error creating product: ' + error.message);
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
      cantitate: product.cantitate,
      pret_cost: product.pret_cost || 0,
      pret_offline: product.pret_offline || 0,
      pret_online: product.pret_online || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

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
            <h1 className="text-3xl font-black text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your products, prices, and availability</p>
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
              {cat.icon} {cat.name} ({products.filter(p => p.category_id === cat.category_id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
            <p className="text-gray-500 text-lg font-bold mb-2">No products found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or add a new product</p>
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
                  <span>Quantity: <strong>{product.cantitate}</strong></span>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-black mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                      {cat.icon} {cat.name}
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

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingProduct ? '💾 Update' : '➕ Create'}
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