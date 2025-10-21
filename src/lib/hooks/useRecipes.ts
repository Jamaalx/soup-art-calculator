import { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '@/types';
import { recipeService } from '@/lib/services/recipeService';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipes();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newRecipe = await recipeService.createRecipe(recipe);
      setRecipes([newRecipe, ...recipes]);
      return newRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      throw err;
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, updates);
      setRecipes(recipes.map(r => r.id === id ? updatedRecipe : r));
      return updatedRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
      throw err;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refresh: loadRecipes
  };
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getIngredients();
      setIngredients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const createIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newIngredient = await recipeService.createIngredient(ingredient);
      setIngredients([...ingredients, newIngredient]);
      return newIngredient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ingredient');
      throw err;
    }
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    try {
      const updatedIngredient = await recipeService.updateIngredient(id, updates);
      setIngredients(ingredients.map(i => i.id === id ? updatedIngredient : i));
      return updatedIngredient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ingredient');
      throw err;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await recipeService.deleteIngredient(id);
      setIngredients(ingredients.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ingredient');
      throw err;
    }
  };

  return {
    ingredients,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    refresh: loadIngredients
  };
}

export function useRecipeInsights() {
  const [insights, setInsights] = useState<{
    totalRecipes: number;
    averageFoodCost: number;
    mostProfitable: Recipe | null;
    leastProfitable: Recipe | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipeInsights();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    loading,
    error,
    refresh: loadInsights
  };
}