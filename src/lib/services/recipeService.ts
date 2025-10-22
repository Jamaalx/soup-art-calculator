import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';

const supabase = createClient();

// Use actual database types
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update'];

export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'];
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert'];
export type RecipeIngredientUpdate = Database['public']['Tables']['recipe_ingredients']['Update'];

export const recipeService = {
  // Get all recipes for the current company
  async getRecipes(): Promise<Recipe[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('company_id', profile?.company_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single recipe
  async getRecipe(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new recipe
  async createRecipe(recipe: RecipeInsert): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recipe
  async updateRecipe(id: string, updates: RecipeUpdate): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete recipe (soft delete)
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Get recipe ingredients
  async getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId);

    if (error) throw error;
    return data || [];
  },

  // Add ingredient to recipe
  async addRecipeIngredient(recipeIngredient: RecipeIngredientInsert): Promise<RecipeIngredient> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert(recipeIngredient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recipe ingredient
  async updateRecipeIngredient(id: string, updates: RecipeIngredientUpdate): Promise<RecipeIngredient> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove ingredient from recipe
  async removeRecipeIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get recipes by category
  async getRecipesByCategory(companyId: string, category: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};