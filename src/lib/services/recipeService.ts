import { createClient } from '@/lib/supabase/client';
import { Recipe, Ingredient, RecipeIngredient } from '@/types';

const supabase = createClient();

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
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    // Calculate costs
    const totalCost = recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
    const costPerServing = totalCost / recipe.servings;
    const profitMargin = recipe.selling_price 
      ? ((recipe.selling_price - costPerServing) / recipe.selling_price) * 100
      : 0;

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipe,
        company_id: profile?.company_id,
        total_cost: totalCost,
        cost_per_serving: costPerServing,
        profit_margin: profitMargin
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recipe
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    // Recalculate costs if ingredients changed
    let calculatedUpdates = { ...updates };
    
    if (updates.ingredients || updates.servings) {
      const totalCost = updates.ingredients 
        ? updates.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
        : 0;
      const costPerServing = totalCost / (updates.servings || 1);
      const profitMargin = updates.selling_price 
        ? ((updates.selling_price - costPerServing) / updates.selling_price) * 100
        : 0;

      calculatedUpdates = {
        ...calculatedUpdates,
        total_cost: totalCost,
        cost_per_serving: costPerServing,
        profit_margin: profitMargin
      };
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(calculatedUpdates)
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

  // Link recipe to product
  async linkToProduct(recipeId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .update({ product_id: productId })
      .eq('id', recipeId);

    if (error) throw error;

    // Update product cost based on recipe
    const recipe = await this.getRecipe(recipeId);
    if (recipe) {
      await supabase
        .from('products')
        .update({ pret_cost: recipe.cost_per_serving })
        .eq('id', productId);
    }
  },

  // Get ingredients
  async getIngredients(): Promise<Ingredient[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('company_id', profile?.company_id)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Create ingredient
  async createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        ...ingredient,
        company_id: profile?.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update ingredient
  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update(updates)
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
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Calculate recipe profitability
  calculateProfitability(recipe: Recipe, sellingPrice: number): {
    profit: number;
    profitMargin: number;
    markupPercent: number;
  } {
    const profit = sellingPrice - recipe.cost_per_serving;
    const profitMargin = (profit / sellingPrice) * 100;
    const markupPercent = (profit / recipe.cost_per_serving) * 100;

    return {
      profit,
      profitMargin,
      markupPercent
    };
  },

  // Get recipe insights
  async getRecipeInsights(): Promise<{
    totalRecipes: number;
    averageFoodCost: number;
    mostProfitable: Recipe | null;
    leastProfitable: Recipe | null;
  }> {
    const recipes = await this.getRecipes();
    
    const totalRecipes = recipes.length;
    const averageFoodCost = recipes.reduce((sum, r) => sum + r.cost_per_serving, 0) / totalRecipes || 0;
    
    const withProfit = recipes.filter(r => r.selling_price && r.profit_margin);
    const mostProfitable = withProfit.sort((a, b) => (b.profit_margin || 0) - (a.profit_margin || 0))[0] || null;
    const leastProfitable = withProfit.sort((a, b) => (a.profit_margin || 0) - (b.profit_margin || 0))[0] || null;

    return {
      totalRecipes,
      averageFoodCost,
      mostProfitable,
      leastProfitable
    };
  }
};