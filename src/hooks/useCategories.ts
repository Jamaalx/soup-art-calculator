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

      // Try to get user's profile and company_id
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id, role')
        .eq('user_id', user.id)
        .single();

      console.log('User profile data:', profileData);
      console.log('Profile error:', profileError);

      const companyId = profileData && !profileError ? profileData.company_id : null;
      const userRole = profileData && !profileError ? profileData.role : null;

      // Build query
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      // Apply filtering based on user context
      // If user is admin, show all categories
      // Otherwise filter by company_id or user_id
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        if (companyId) {
          // User belongs to a company - show company categories
          query = query.eq('company_id', companyId);
        } else {
          // User doesn't have company - show only their categories
          // Also include categories where user_id matches OR company_id is null
          query = query.or(`user_id.eq.${user.id},and(company_id.is.null,user_id.is.null)`);
        }
      }
      // If admin, no filter is applied (shows all categories)

      const { data: dbCategories, error: dbError } = await query
        .order('name', { ascending: true });

      if (dbError) {
        console.error('Error fetching categories:', dbError);
        throw dbError;
      }

      // Set categories (even if empty array)
      if (dbCategories && dbCategories.length > 0) {
        console.log(`Loaded ${dbCategories.length} categories`);
        setCategories(dbCategories);
      } else {
        console.log('No categories found');
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