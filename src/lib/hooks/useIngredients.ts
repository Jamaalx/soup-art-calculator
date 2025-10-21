import { useState, useEffect, useCallback } from 'react';
import { Ingredient, IngredientPriceHistory, IngredientPriceInsights } from '@/types';
import { ingredientService } from '@/lib/services/ingredientService';

export function useIngredients(companyId: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getIngredients(companyId);
      setIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const createIngredient = useCallback(async (ingredientData: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newIngredient = await ingredientService.createIngredient(ingredientData);
      setIngredients(prev => [...prev, newIngredient]);
      return newIngredient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ingredient');
      throw err;
    }
  }, []);

  const updateIngredient = useCallback(async (
    id: string, 
    updates: Partial<Ingredient>,
    priceChangeReason?: string
  ) => {
    try {
      const updatedIngredient = await ingredientService.updateIngredient(id, updates, priceChangeReason);
      setIngredients(prev => prev.map(ing => ing.id === id ? updatedIngredient : ing));
      return updatedIngredient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ingredient');
      throw err;
    }
  }, []);

  const deleteIngredient = useCallback(async (id: string) => {
    try {
      await ingredientService.deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ingredient');
      throw err;
    }
  }, []);

  return {
    ingredients,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    refetch: fetchIngredients
  };
}

export function useIngredientPriceHistory(ingredientId: string) {
  const [priceHistory, setPriceHistory] = useState<IngredientPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    if (!ingredientId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getPriceHistory(ingredientId);
      setPriceHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price history');
    } finally {
      setLoading(false);
    }
  }, [ingredientId]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  return {
    priceHistory,
    loading,
    error,
    refetch: fetchPriceHistory
  };
}

export function useIngredientPriceInsights(ingredientId: string) {
  const [insights, setInsights] = useState<IngredientPriceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!ingredientId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getIngredientPriceInsights(ingredientId);
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price insights');
    } finally {
      setLoading(false);
    }
  }, [ingredientId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
}

export function useCompanyPriceInsights(companyId: string) {
  const [insights, setInsights] = useState<IngredientPriceInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getCompanyPriceInsights(companyId);
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company price insights');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
}

export function useRecentPriceChanges(companyId: string, days: number = 30) {
  const [recentChanges, setRecentChanges] = useState<{
    ingredient: Ingredient;
    latestChange: IngredientPriceHistory;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentChanges = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getIngredientsWithRecentPriceChanges(companyId, days);
      setRecentChanges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent price changes');
    } finally {
      setLoading(false);
    }
  }, [companyId, days]);

  useEffect(() => {
    fetchRecentChanges();
  }, [fetchRecentChanges]);

  return {
    recentChanges,
    loading,
    error,
    refetch: fetchRecentChanges
  };
}