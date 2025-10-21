import { useState, useEffect, useCallback } from 'react';
import { Category, categoriesService } from '@/lib/services/categoriesService';

export function useCategories(companyId: string, type?: 'ingredient' | 'recipe' | 'product') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.getCategories(companyId, type);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [companyId, type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await categoriesService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await categoriesService.updateCategory(id, updates);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await categoriesService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, []);

  const initializeDefaults = useCallback(async () => {
    try {
      await categoriesService.initializeDefaultCategories(companyId);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize default categories');
      throw err;
    }
  }, [companyId, fetchCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    initializeDefaults,
    refetch: fetchCategories
  };
}