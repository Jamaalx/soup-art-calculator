import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';

const supabase = createClient();

// Use actual database types
export type Ingredient = Database['public']['Tables']['ingredients']['Row'];
export type IngredientInsert = Database['public']['Tables']['ingredients']['Insert'];
export type IngredientUpdate = Database['public']['Tables']['ingredients']['Update'];

export const ingredientService = {
  // Get all ingredients for a company
  async getIngredients(companyId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get ingredient by ID
  async getIngredient(id: string): Promise<Ingredient | null> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new ingredient
  async createIngredient(ingredient: IngredientInsert): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update ingredient
  async updateIngredient(id: string, updates: IngredientUpdate): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete ingredient (soft delete)
  async deleteIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from('ingredients')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  // Get ingredients by category
  async getIngredientsByCategory(companyId: string, category: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};