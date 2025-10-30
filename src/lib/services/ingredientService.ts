import { createClient } from '@/lib/supabase/client';
import { Ingredient, IngredientPriceHistory, IngredientPriceInsights } from '@/types';

const supabase = createClient();
export const ingredientService = {
  // Get all ingredients for a company
  async getIngredients(companyId: string): Promise<Ingredient[]> {
    // Get current user to determine proper filtering
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to check role and actual company_id
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    const actualCompanyId = profileData && !profileError ? profileData.company_id : null;
    const userRole = profileData && !profileError ? profileData.role : null;

    // Build query with proper filtering
    let query = supabase
      .from('ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name');

    // Apply filtering based on user context
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      if (actualCompanyId) {
        // User belongs to a company - show company ingredients
        query = query.eq('company_id', actualCompanyId);
      } else {
        // User doesn't have company - show only their ingredients
        query = query.eq('user_id', user.id);
      }
    }
    // If admin, no filter is applied (shows all ingredients)

    const { data, error } = await query;

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
  async createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update ingredient with price tracking
  async updateIngredient(
    id: string, 
    updates: Partial<Ingredient>,
    priceChangeReason?: string
  ): Promise<Ingredient> {
    // Get current ingredient data
    const currentIngredient = await this.getIngredient(id);
    if (!currentIngredient) {
      throw new Error('Ingredient not found');
    }

    // If price is being updated, record the price history
    if (updates.cost_per_unit && updates.cost_per_unit !== currentIngredient.cost_per_unit) {
      await this.recordPriceChange(
        id,
        currentIngredient.cost_per_unit,
        updates.cost_per_unit,
        currentIngredient.company_id,
        priceChangeReason,
        updates.supplier_id ?? undefined,
        updates.purchase_location ?? undefined
      );
    }

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

  // Record price change in history
  async recordPriceChange(
    ingredientId: string,
    oldPrice: number,
    newPrice: number,
    companyId: string,
    changeReason?: string,
    supplierId?: string,
    purchaseLocation?: string
  ): Promise<IngredientPriceHistory> {
    const priceChange = newPrice - oldPrice;
    const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

    const priceHistoryEntry: Omit<IngredientPriceHistory, 'id'> = {
      ingredient_id: ingredientId,
      old_price: oldPrice,
      new_price: newPrice,
      price_change: priceChange,
      price_change_percent: priceChangePercent,
      change_reason: changeReason,
      supplier_id: supplierId,
      purchase_location: purchaseLocation,
      recorded_at: new Date().toISOString(),
      company_id: companyId
    };

    const { data, error } = await supabase
      .from('ingredient_price_history')
      .insert(priceHistoryEntry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get price history for an ingredient
  async getPriceHistory(ingredientId: string): Promise<IngredientPriceHistory[]> {
    const { data, error } = await supabase
      .from('ingredient_price_history')
      .select('*')
      .eq('ingredient_id', ingredientId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get price insights for an ingredient
  async getIngredientPriceInsights(ingredientId: string): Promise<IngredientPriceInsights | null> {
    const [ingredient, priceHistory] = await Promise.all([
      this.getIngredient(ingredientId),
      this.getPriceHistory(ingredientId)
    ]);

    if (!ingredient || priceHistory.length === 0) {
      return null;
    }

    // Calculate trend based on recent price changes
    const recentChanges = priceHistory.slice(0, 5); // Last 5 changes
    const avgChange = recentChanges.reduce((sum, change) => sum + change.price_change_percent, 0) / recentChanges.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (avgChange > 2) trend = 'increasing';
    else if (avgChange < -2) trend = 'decreasing';

    // Calculate total change from first to current price
    const firstEntry = priceHistory[priceHistory.length - 1];
    const totalChangePercent = firstEntry 
      ? ((ingredient.cost_per_unit - firstEntry.old_price) / firstEntry.old_price) * 100 
      : 0;

    // Find highest and lowest prices
    const allPrices = [
      ingredient.cost_per_unit,
      ...priceHistory.map(h => h.old_price),
      ...priceHistory.map(h => h.new_price)
    ];
    const highestPrice = Math.max(...allPrices);
    const lowestPrice = Math.min(...allPrices);

    // Find dates for highest and lowest
    const highestEntry = priceHistory.find(h => h.new_price === highestPrice || h.old_price === highestPrice);
    const lowestEntry = priceHistory.find(h => h.new_price === lowestPrice || h.old_price === lowestPrice);

    // Calculate average monthly change
    const monthsSpan = priceHistory.length > 0 
      ? Math.max(1, Math.ceil((Date.now() - new Date(priceHistory[priceHistory.length - 1].recorded_at).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;
    const averageMonthlyChange = totalChangePercent / monthsSpan;

    return {
      ingredient_id: ingredientId,
      ingredient_name: ingredient.name,
      current_price: ingredient.cost_per_unit,
      price_history: priceHistory,
      price_trend: trend,
      total_change_percent: totalChangePercent,
      average_monthly_change: averageMonthlyChange,
      highest_price: {
        price: highestPrice,
        date: highestEntry?.recorded_at || new Date().toISOString()
      },
      lowest_price: {
        price: lowestPrice,
        date: lowestEntry?.recorded_at || new Date().toISOString()
      },
      last_updated: ingredient.updated_at || ingredient.created_at || new Date().toISOString()
    };
  },

  // Get price insights for all company ingredients
  async getCompanyPriceInsights(companyId: string): Promise<IngredientPriceInsights[]> {
    const ingredients = await this.getIngredients(companyId);
    
    const insights = await Promise.all(
      ingredients.map(async (ingredient) => {
        return await this.getIngredientPriceInsights(ingredient.id);
      })
    );

    return insights.filter(insight => insight !== null) as IngredientPriceInsights[];
  },

  // Get ingredients with recent price changes
  async getIngredientsWithRecentPriceChanges(companyId: string, days: number = 30): Promise<{
    ingredient: Ingredient;
    latestChange: IngredientPriceHistory;
  }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('ingredient_price_history')
      .select(`
        *,
        ingredients (*)
      `)
      .eq('company_id', companyId)
      .gte('recorded_at', cutoffDate.toISOString())
      .order('recorded_at', { ascending: false });

    if (error) throw error;

    // Group by ingredient and get latest change for each
    const groupedChanges = new Map();
    
    data?.forEach(change => {
      if (!groupedChanges.has(change.ingredient_id)) {
        groupedChanges.set(change.ingredient_id, {
          ingredient: change.ingredients,
          latestChange: change
        });
      }
    });

    return Array.from(groupedChanges.values());
  }
};