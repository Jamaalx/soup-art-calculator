'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import OfferGenerator from '../../../components/OfferGenerator';

// Match the Product interface that OfferGenerator expects (with both formats)
interface Product {
  id: string;  // ✅ Required, not optional
  product_id: string;
  nume: string;
  category_id: string;
  cantitate?: string | null;
  pret_cost: number;
  pret_offline?: number | null;
  pret_online?: number | null;
  is_active?: boolean;
  // OfferGenerator expected format (camelCase)
  pretCost: number;
  pretOffline?: number;
  pretOnline?: number;
  category: string;
  isActive: boolean;
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not logged in');
      setLoading(false);
      return;
    }

    // Fetch user's products
    const { data, error } = await supabase
      .from('products')
      .select('id, product_id, nume, category_id, cantitate, pret_cost, pret_offline, pret_online, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('nume');

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('✅ Loaded products for offers:', data?.length);
      
      // Transform database format to OfferGenerator format
      // Filter out any products without an ID (shouldn't happen, but for type safety)
      const transformedProducts = (data || [])
        .filter(item => item.id) // Ensure ID exists
        .map(item => ({
          id: item.id!, // Non-null assertion since we filtered
          product_id: item.product_id,
          nume: item.nume,
          category_id: item.category_id,
          cantitate: item.cantitate || undefined,
          pretCost: item.pret_cost,
          pretOffline: item.pret_offline || undefined,
          pretOnline: item.pret_online || undefined,
          category: item.category_id, // Using category_id as category
          isActive: item.is_active ?? true,
          pret_cost: item.pret_cost,
          pret_offline: item.pret_offline,
          pret_online: item.pret_online,
          is_active: item.is_active
        }));
      
      setProducts(transformedProducts);
    }

    setLoading(false);
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

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No Products Available</h2>
          <p className="text-gray-600 mb-6">
            You need to add products before you can generate offers.
          </p>
          <a
            href="/admin/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            ➕ Add Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OfferGenerator products={products} />
    </div>
  );
}