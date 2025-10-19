import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductCategory } from '@/types';

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
    category_id: string; // This is the slug! "ciorbe", "felPrincipal", etc.
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

      // Create Supabase client
      const supabase = createClient();

      // Fetch products with category join - RLS automatically filters by user_id = auth.uid()
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            category_id,
            name,
            icon,
            color
          )
        `)
        .order('category_id', { ascending: true })
        .order('nume', { ascending: true });

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError('Nu s-au putut încărca produsele. Verifică conexiunea.');
        return;
      }

      // Transform database records to Product type
      const transformedProducts: Product[] = (data || []).map((dbProduct: DbProduct) => {
        // Get category_id (slug) from join - this is already the correct format!
        const categorySlug = dbProduct.categories?.category_id || 'felPrincipal';
        
        return {
          id: dbProduct.id,
          nume: dbProduct.nume || '',
          cantitate: dbProduct.cantitate || '',
          pretCost: dbProduct.pret_cost || 0,
          pretOffline: dbProduct.pret_offline || 0,
          pretOnline: dbProduct.pret_online || 0,
          pretCatering: dbProduct.pret_offline || 0, // Use offline price as catering fallback
          category: categorySlug as ProductCategory, // category_id IS the slug
          isActive: dbProduct.is_active ?? true,
          createdAt: dbProduct.created_at || new Date().toISOString(),
          updatedAt: dbProduct.updated_at || new Date().toISOString()
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