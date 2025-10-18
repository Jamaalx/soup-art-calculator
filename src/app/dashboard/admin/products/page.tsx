'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function AdminProductsPage() {
  const { products, ciorbe, felPrincipal, garnituri, bauturi, loading, refreshProducts } = useProducts();
  const [activeTab, setActiveTab] = useState<'all' | 'ciorba' | 'fel_principal' | 'garnitura' | 'bautura'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();
  
  const categories = [
    { id: 'all', label: 'All Products', icon: '📦', count: products.length },
    { id: 'ciorba', label: 'Ciorbe', icon: '🍲', count: ciorbe.length },
    { id: 'fel_principal', label: 'Fel Principal', icon: '🍖', count: felPrincipal.length },
    { id: 'garnitura', label: 'Garnituri', icon: '🥔', count: garnituri.length },
    { id: 'bautura', label: 'Băuturi', icon: '🥤', count: bauturi.length }
  ];

  const filteredProducts = () => {
    let filtered = products;
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.category === activeTab);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in');
        return;
      }

      // Find the product to get its database ID
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (!dbProducts) {
        alert('Product not found');
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', dbProducts.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
        return;
      }

      alert('Product deleted successfully!');
      refreshProducts();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading products...</p>
        </div>
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
            <p className="text-gray-600">Manage your menu products and pricing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => alert('Export feature coming soon!')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => alert('Add product feature coming soon!')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
            >
              ➕ Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`p-4 rounded-xl border-2 transition-all ${
              activeTab === cat.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-sm font-bold">{cat.label}</div>
            <div className="text-2xl font-black mt-1">{cat.count}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
        <input
          type="text"
          placeholder="🔍 Search products by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts().length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-2">Products will load from TypeScript files as fallback</p>
          </div>
        ) : (
          filteredProducts().map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-black text-gray-900 text-lg">{product.nume}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                  {product.category}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs text-gray-500">{product.id}</span>
                </div>
                {product.cantitate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{product.cantitate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-bold text-green-600">{product.pretCost.toFixed(2)} lei</span>
                </div>
                {product.pretOffline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offline:</span>
                    <span className="font-bold">{product.pretOffline.toFixed(2)} lei</span>
                  </div>
                )}
                {product.pretOnline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Online:</span>
                    <span className="font-bold">{product.pretOnline.toFixed(2)} lei</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => alert('Edit feature coming soon!')}
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
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-black text-blue-600">{products.length}</p>
            <p className="text-sm text-gray-600 font-semibold">Total Products</p>
          </div>
          <div>
            <p className="text-3xl font-black text-green-600">{ciorbe.length}</p>
            <p className="text-sm text-gray-600 font-semibold">Ciorbe</p>
          </div>
          <div>
            <p className="text-3xl font-black text-orange-600">{felPrincipal.length}</p>
            <p className="text-sm text-gray-600 font-semibold">Fel Principal</p>
          </div>
          <div>
            <p className="text-3xl font-black text-purple-600">{garnituri.length}</p>
            <p className="text-sm text-gray-600 font-semibold">Garnituri</p>
          </div>
        </div>
      </div>
    </div>
  );
}