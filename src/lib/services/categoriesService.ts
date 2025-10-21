import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  type: 'ingredient' | 'recipe' | 'product';
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export const categoriesService = {
  // Get categories by type and company
  async getCategories(companyId: string, type?: 'ingredient' | 'recipe' | 'product'): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Create new category
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update category
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
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
      { name: 'Meat', type: 'ingredient', icon: '🥩', color: '#DC2626' },
      { name: 'Vegetables', type: 'ingredient', icon: '🥕', color: '#16A34A' },
      { name: 'Dairy', type: 'ingredient', icon: '🥛', color: '#3B82F6' },
      { name: 'Oils & Fats', type: 'ingredient', icon: '🛢️', color: '#F59E0B' },
      { name: 'Spices & Herbs', type: 'ingredient', icon: '🌿', color: '#10B981' },
      { name: 'Grains & Cereals', type: 'ingredient', icon: '🌾', color: '#8B5CF6' },
      { name: 'Seafood', type: 'ingredient', icon: '🐟', color: '#0EA5E9' },
      { name: 'Fruits', type: 'ingredient', icon: '🍎', color: '#EF4444' },
      { name: 'Beverages', type: 'ingredient', icon: '🥤', color: '#6366F1' },
      { name: 'Other', type: 'ingredient', icon: '📦', color: '#6B7280' }
    ];

    const defaultRecipeCategories = [
      { name: 'Ciorbe și Supe', type: 'recipe', icon: '🍲', color: '#DC2626' },
      { name: 'Feluri Principale', type: 'recipe', icon: '🍽️', color: '#16A34A' },
      { name: 'Garnituri', type: 'recipe', icon: '🥗', color: '#F59E0B' },
      { name: 'Salate', type: 'recipe', icon: '🥬', color: '#10B981' },
      { name: 'Deserturi', type: 'recipe', icon: '🍰', color: '#8B5CF6' },
      { name: 'Băuturi', type: 'recipe', icon: '☕', color: '#6366F1' }
    ];

    const categoriesToInsert = [
      ...defaultIngredientCategories.map(cat => ({
        name: cat.name,
        type: cat.type as 'ingredient',
        icon: cat.icon,
        color: cat.color,
        is_active: true,
        company_id: companyId
      })),
      ...defaultRecipeCategories.map(cat => ({
        name: cat.name,
        type: cat.type as 'recipe',
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