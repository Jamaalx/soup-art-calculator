// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Category {
  id: string;
  category_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  company_id: string | null;
  user_id: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, showing empty category list');
        setCategories([]);
        setLoading(false);
        return;
      }

      console.log('Fetching categories for user:', user.id);

      // Fetch categories from database
      const { data: dbCategories, error: dbError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (dbError) {
        console.error('Error fetching categories:', dbError);
        throw dbError;
      }

      // Set categories (even if empty array)
      if (dbCategories && dbCategories.length > 0) {
        console.log(`✅ Loaded ${dbCategories.length} categories for user`);
        setCategories(dbCategories);
      } else {
        console.log('ℹ️ User has 0 categories. They need to create categories or admin must assign templates.');
        setCategories([]);
      }

    } catch (err: any) {
      console.error('Error in useCategories:', err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          console.log('Categories changed, refreshing...');
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
}