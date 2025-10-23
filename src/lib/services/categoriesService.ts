import { createClient } from '@/lib/supabase/client';
import { Recipe, Ingredient, RecipeIngredient } from '@/types';
import { Database } from '@/lib/supabase/database';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface Category {
  id: string;
  name: string;
  type: 'ingredient' | 'recipe' | 'product';
  icon?: string;
  color?: string;
  is_active: boolean;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions to convert between database rows and Category interface
function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.category_id as 'ingredient' | 'recipe' | 'product',
    icon: row.icon || undefined,
    color: row.color || undefined,
    is_active: row.is_active,
    company_id: row.company_id || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function categoryToInsert(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): CategoryInsert {
  return {
    category_id: category.type,
    name: category.name,
    icon: category.icon || null,
    color: category.color || null,
    is_active: category.is_active,
    company_id: category.company_id,
  };
}

function categoryToUpdate(updates: Partial<Category>): CategoryUpdate {
  const result: CategoryUpdate = {};
  if (updates.type) result.category_id = updates.type;
  if (updates.name !== undefined) result.name = updates.name;
  if (updates.icon !== undefined) result.icon = updates.icon || null;
  if (updates.color !== undefined) result.color = updates.color || null;
  if (updates.is_active !== undefined) result.is_active = updates.is_active;
  if (updates.company_id !== undefined) result.company_id = updates.company_id;
  result.updated_at = new Date().toISOString();
  return result;
}

export const categoriesService = {
  // Get categories by type and company
  async getCategories(companyId: string, type?: 'ingredient' | 'recipe' | 'product'): Promise<Category[]> {
    const supabase = createClient();
    let query = supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (type) {
      query = query.eq('category_id', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(rowToCategory);
  },

  // Create new category
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryToInsert(category))
      .select()
      .single();

    if (error) throw error;
    return rowToCategory(data);
  },

  // Update category
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .update(categoryToUpdate(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToCategory(data);
  },

  // Delete category (soft delete)
  async deleteCategory(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Initialize default categories for a company
  async initializeDefaultCategories(companyId: string): Promise<void> {
    const supabase = createClient();
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

    const categoriesToInsert: CategoryInsert[] = [
      ...defaultIngredientCategories.map(cat => ({
        category_id: cat.type,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_active: true,
        company_id: companyId
      })),
      ...defaultRecipeCategories.map(cat => ({
        category_id: cat.type,
        name: cat.name,
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