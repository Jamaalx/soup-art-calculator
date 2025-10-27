import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

// Database product type from Supabase (matching your actual schema)
interface DbProduct {
  id: string;
  product_id: string;
  company_id: string | null;
  user_id: string | null;
  nume: string;
  cantitate: string | null;
  pret_cost: number;
  pret_offline: number | null;
  pret_online: number | null;
  category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    category_id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get user's company_id from user_profiles
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      const companyId = profileData?.company_id;

      // Build query with proper filtering
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            category_id,
            name,
            icon,
            color
          )
        `);

      // Filter by company_id if available, otherwise filter by user_id
      if (companyId) {
        query = query.eq('company_id', companyId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query
        .order('category_id', { ascending: true })
        .order('nume', { ascending: true });

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError('Nu s-au putut încărca produsele. Verifică conexiunea.');
        return;
      }

      // Transform database records to Product type - MATCH types/index.ts
      const transformedProducts: Product[] = (data || []).map((dbProduct: DbProduct) => {
        const categorySlug = dbProduct.categories?.category_id || dbProduct.category_id;
        
        return {
          id: dbProduct.id,
          product_id: dbProduct.product_id,
          nume: dbProduct.nume,
          category_id: dbProduct.category_id,
          company_id: dbProduct.company_id,
          cantitate: dbProduct.cantitate,
          pret_cost: dbProduct.pret_cost,
          pret_offline: dbProduct.pret_offline,
          pret_online: dbProduct.pret_online,
          is_active: dbProduct.is_active,
          pretCost: dbProduct.pret_cost,
          pretOffline: dbProduct.pret_offline ?? undefined,
          pretOnline: dbProduct.pret_online ?? undefined,
          category: categorySlug
        };
      });

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Eroare neașteptată la încărcarea produselor.');
    } finally {
      setLoading(false);
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}