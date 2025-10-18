// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Import your existing product types and data as fallback
import { CIORBE, FELPRINCIPAL, GARNITURI, BAUTURI } from '@/lib/data/products';

// Match your existing Product interface
export interface Product {
  id: string;
  nume: string;
  cantitate?: string;
  pretCost: number;
  category: string;
  pretOffline?: number;
  pretOnline?: number;
}

// Database product type (what comes from Supabase)
interface DbProduct {
  id?: string;
  user_id?: string;
  product_id: string;
  nume: string;
  cantitate?: string;
  pret_cost: number;
  pret_offline?: number;
  pret_online?: number;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UseProductsReturn {
  products: Product[];
  ciorbe: Product[];
  felPrincipal: Product[];
  garnituri: Product[];
  bauturi: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

// Convert database format to app format
function mapDbProductToApp(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.product_id,
    nume: dbProduct.nume,
    cantitate: dbProduct.cantitate,
    pretCost: dbProduct.pret_cost,
    pretOffline: dbProduct.pret_offline,
    pretOnline: dbProduct.pret_online,
    category: dbProduct.category
  };
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // Not logged in - use TypeScript fallback
        console.log('No user found, using fallback products');
        const fallbackProducts = [
          ...CIORBE.map(p => ({ ...p, category: 'ciorba' })),
          ...FELPRINCIPAL.map(p => ({ ...p, category: 'fel_principal' })),
          ...GARNITURI.map(p => ({ ...p, category: 'garnitura' })),
          ...BAUTURI.map(p => ({ ...p, category: 'bautura' }))
        ];
        setProducts(fallbackProducts);
        setLoading(false);
        return;
      }

      // Try to fetch from database
      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('nume', { ascending: true });

      if (dbError) {
        console.error('Error fetching products:', dbError);
        throw dbError;
      }

      // If user has products in DB, use them
      if (dbProducts && dbProducts.length > 0) {
        const appProducts = dbProducts.map(mapDbProductToApp);
        setProducts(appProducts);
      } else {
        // No products yet - initialize from templates
        console.log('No products found, initializing from templates...');
        await initializeUserProducts(user.id);
        
        // Fetch again after initialization
        const { data: newProducts, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (fetchError) throw fetchError;
        
        if (newProducts && newProducts.length > 0) {
          const appProducts = newProducts.map(mapDbProductToApp);
          setProducts(appProducts);
        } else {
          // Still no products - use fallback
          const fallbackProducts = [
            ...CIORBE.map(p => ({ ...p, category: 'ciorba' })),
            ...FELPRINCIPAL.map(p => ({ ...p, category: 'fel_principal' })),
            ...GARNITURI.map(p => ({ ...p, category: 'garnitura' })),
            ...BAUTURI.map(p => ({ ...p, category: 'bautura' }))
          ];
          setProducts(fallbackProducts);
        }
      }
    } catch (err: any) {
      console.error('Error in useProducts:', err);
      setError(err.message);
      
      // Fallback to TypeScript files on any error
      const fallbackProducts = [
        ...CIORBE.map(p => ({ ...p, category: 'ciorba' })),
        ...FELPRINCIPAL.map(p => ({ ...p, category: 'fel_principal' })),
        ...GARNITURI.map(p => ({ ...p, category: 'garnitura' })),
        ...BAUTURI.map(p => ({ ...p, category: 'bautura' }))
      ];
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const initializeUserProducts = async (userId: string) => {
    try {
      // Fetch product templates
      const { data: templates, error: templatesError } = await supabase
        .from('product_templates')
        .select('*')
        .eq('is_active', true);

      if (templatesError) {
        console.error('Error fetching templates:', templatesError);
        throw templatesError;
      }

      if (templates && templates.length > 0) {
        // Copy templates to user products
        const userProducts = templates.map(template => ({
          user_id: userId,
          product_id: template.product_id,
          nume: template.nume,
          cantitate: template.cantitate,
          pret_cost: template.pret_cost,
          pret_offline: template.pret_offline || 0,
          pret_online: template.pret_online || 0,
          category: template.category,
          is_active: true
        }));

        const { error: insertError } = await supabase
          .from('products')
          .insert(userProducts);

        if (insertError) {
          console.error('Error inserting products:', insertError);
          throw insertError;
        }
        
        console.log(`✅ Initialized ${userProducts.length} products for user`);
      } else {
        // No templates - use TypeScript files
        console.log('No templates found, using TypeScript files as source');
        const allProducts = [
          ...CIORBE.map(p => ({ ...p, category: 'ciorba' })),
          ...FELPRINCIPAL.map(p => ({ ...p, category: 'fel_principal' })),
          ...GARNITURI.map(p => ({ ...p, category: 'garnitura' })),
          ...BAUTURI.map(p => ({ ...p, category: 'bautura' }))
        ];
        
        const userProducts = allProducts.map((product, index) => ({
          user_id: userId,
          product_id: product.id || `${product.category}-${index + 1}`,
          nume: product.nume,
          cantitate: product.cantitate,
          pret_cost: product.pretCost,
          pret_offline: 0,
          pret_online: 0,
          category: product.category,
          is_active: true
        }));

        const { error: insertError } = await supabase
          .from('products')
          .insert(userProducts);

        if (insertError) {
          console.error('Error inserting products from TS files:', insertError);
          throw insertError;
        }
        
        console.log(`✅ Initialized ${userProducts.length} products from TypeScript files`);
      }
    } catch (err) {
      console.error('Error initializing user products:', err);
      // Don't throw - let the hook fall back to TypeScript files
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime updates (optional)
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Products changed, refreshing...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Separate products by category
  const ciorbe = products.filter(p => p.category === 'ciorba');
  const felPrincipal = products.filter(p => p.category === 'fel_principal');
  const garnituri = products.filter(p => p.category === 'garnitura');
  const bauturi = products.filter(p => p.category === 'bautura');

  return {
    products,
    ciorbe,
    felPrincipal,
    garnituri,
    bauturi,
    loading,
    error,
    refreshProducts: fetchProducts
  };
}