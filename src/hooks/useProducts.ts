'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Product } from '@/types';

// Import default products
import { ALL_PRODUCTS } from '@/lib/data/products';

export function useProducts() {
  const { user } = useAuth();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // If user has no products, initialize with defaults
      if (!data || data.length === 0) {
        await initializeDefaultProducts();
        return;
      }

      // Map database products to Product type
      const mappedProducts: Product[] = data.map(p => ({
        id: p.id,
        nume: p.nume,
        cantitate: p.cantitate,
        pretCost: p.pret_cost,
        pretOffline: p.pret_offline,
        pretOnline: p.pret_online,
        category: p.category as any,
        isActive: p.is_active,
      }));

      setProducts(mappedProducts);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultProducts = async () => {
    if (!user) return;

    try {
      const defaultProducts = ALL_PRODUCTS;
      
      // Convert Product[] to database format
      const productsToInsert = defaultProducts.map(p => ({
        user_id: user.id,
        nume: p.nume,
        cantitate: p.cantitate,
        pret_cost: p.pretCost,
        pret_offline: p.pretOffline,
        pret_online: p.pretOnline,
        category: p.category,
        is_active: p.isActive,
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      // Reload products after initialization
      await loadProducts();
    } catch (err: any) {
      setError(err.message);
      console.error('Error initializing products:', err);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          nume: product.nume,
          cantitate: product.cantitate,
          pret_cost: product.pretCost,
          pret_offline: product.pretOffline,
          pret_online: product.pretOnline,
          category: product.category,
          is_active: product.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        nume: data.nume,
        cantitate: data.cantitate,
        pretCost: data.pret_cost,
        pretOffline: data.pret_offline,
        pretOnline: data.pret_online,
        category: data.category,
        isActive: data.is_active,
      };

      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return;

    try {
      const dbUpdates: any = {};
      if (updates.nume !== undefined) dbUpdates.nume = updates.nume;
      if (updates.cantitate !== undefined) dbUpdates.cantitate = updates.cantitate;
      if (updates.pretCost !== undefined) dbUpdates.pret_cost = updates.pretCost;
      if (updates.pretOffline !== undefined) dbUpdates.pret_offline = updates.pretOffline;
      if (updates.pretOnline !== undefined) dbUpdates.pret_online = updates.pretOnline;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts,
  };
}