import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';

const supabase = createClient();

// Use the actual database type
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export const categoriesService = {
  // Get categories by company
  async getCategories(companyId: string, categoryId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Create new category
  async createCategory(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category
  async updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete category (soft delete)
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Initialize default categories for a company
  async initializeDefaultCategories(companyId: string): Promise<void> {
    const defaultIngredientCategories = [
      { name: 'Meat', category_id: 'ingredient', icon: '🥩', color: '#DC2626' },
      { name: 'Vegetables', category_id: 'ingredient', icon: '🥕', color: '#16A34A' },
      { name: 'Dairy', category_id: 'ingredient', icon: '🥛', color: '#3B82F6' },
      { name: 'Oils & Fats', category_id: 'ingredient', icon: '🛢️', color: '#F59E0B' },
      { name: 'Spices & Herbs', category_id: 'ingredient', icon: '🌿', color: '#10B981' },
      { name: 'Grains & Cereals', category_id: 'ingredient', icon: '🌾', color: '#8B5CF6' },
      { name: 'Seafood', category_id: 'ingredient', icon: '🐟', color: '#0EA5E9' },
      { name: 'Fruits', category_id: 'ingredient', icon: '🍎', color: '#EF4444' },
      { name: 'Beverages', category_id: 'ingredient', icon: '🥤', color: '#6366F1' },
      { name: 'Other', category_id: 'ingredient', icon: '📦', color: '#6B7280' }
    ];

    const defaultRecipeCategories = [
      { name: 'Ciorbe și Supe', category_id: 'recipe', icon: '🍲', color: '#DC2626' },
      { name: 'Feluri Principale', category_id: 'recipe', icon: '🍽️', color: '#16A34A' },
      { name: 'Garnituri', category_id: 'recipe', icon: '🥗', color: '#F59E0B' },
      { name: 'Salate', category_id: 'recipe', icon: '🥬', color: '#10B981' },
      { name: 'Deserturi', category_id: 'recipe', icon: '🍰', color: '#8B5CF6' },
      { name: 'Băuturi', category_id: 'recipe', icon: '☕', color: '#6366F1' }
    ];

    const categoriesToInsert: CategoryInsert[] = [
      ...defaultIngredientCategories.map(cat => ({
        name: cat.name,
        category_id: cat.category_id,
        icon: cat.icon,
        color: cat.color,
        is_active: true,
        company_id: companyId
      })),
      ...defaultRecipeCategories.map(cat => ({
        name: cat.name,
        category_id: cat.category_id,
        icon: cat.icon,
        color: cat.color,
        is_active: true,
        company_id: companyId
      }))
    ];

    const { error } = await supabase
      .from('categories')
      .insert(categoriesToInsert);

    if (error) throw error;
  }
};