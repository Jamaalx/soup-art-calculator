// services/productService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface DBProduct {
  id: string;
  product_id: string;
  nume: string;
  category_id: string;
  company_id: string | null;
  cantitate: string | null;
  pret_cost: number;
  pret_offline: number | null;
  pret_online: number | null;
  is_active: boolean;
  user_id: string | null;  // FIXED: Changed from 'string' to 'string | null'
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_id: string;
  nume: string;
  category_id: string;
  company_id?: string | null;
  cantitate?: string | null;
  pret_cost: number;
  pret_offline?: number | null;
  pret_online?: number | null;
  is_active: boolean;  // Always present, never undefined
  pretCost: number;
  pretOffline?: number;
  pretOnline?: number;
  category: string;
}

export interface CreateProductInput {
  product_id: string;
  nume: string;
  cantitate?: string;
  pret_cost: number;
  pret_offline?: number;
  pret_online?: number;
  category_id: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  is_active?: boolean;
}

function transformProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.id,
    product_id: dbProduct.product_id,
    nume: dbProduct.nume,
    category_id: dbProduct.category_id,
    company_id: dbProduct.company_id,
    cantitate: dbProduct.cantitate,
    pret_cost: dbProduct.pret_cost,
    pret_offline: dbProduct.pret_offline,
    pret_online: dbProduct.pret_online,
    is_active: dbProduct.is_active,
    pretCost: dbProduct.pret_cost,
    pretOffline: dbProduct.pret_offline ?? undefined,
    pretOnline: dbProduct.pret_online ?? undefined,
    category: dbProduct.category_id
  };
}

class ProductService {
  private async getUserCompanyId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    return profile?.company_id ?? null;
  }

  async createProduct(input: CreateProductInput): Promise<{ data: Product | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const companyId = await this.getUserCompanyId();

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            company_id: companyId,
            product_id: input.product_id,
            nume: input.nume,
            category_id: input.category_id,
            cantitate: input.cantitate || null,
            pret_cost: input.pret_cost,
            pret_offline: input.pret_offline ?? null,
            pret_online: input.pret_online ?? null,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      return { data: transformProduct(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateProduct(productId: string, updates: UpdateProductInput): Promise<{ data: Product | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const updateData: any = {};
      if (updates.product_id !== undefined) updateData.product_id = updates.product_id;
      if (updates.nume !== undefined) updateData.nume = updates.nume;
      if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
      if (updates.cantitate !== undefined) updateData.cantitate = updates.cantitate || null;
      if (updates.pret_cost !== undefined) updateData.pret_cost = updates.pret_cost;
      if (updates.pret_offline !== undefined) updateData.pret_offline = updates.pret_offline ?? null;
      if (updates.pret_online !== undefined) updateData.pret_online = updates.pret_online ?? null;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      return { data: transformProduct(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteProduct(productId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)
        .eq('user_id', user.id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async permanentDeleteProduct(productId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async getProducts(): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('category_id')
        .order('nume');

      if (error || !data) {
        return { data: [], error };
      }

      return { data: data.map(transformProduct), error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getProductsByCategory(categoryId: string): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('nume');

      if (error || !data) {
        return { data: [], error };
      }

      return { data: data.map(transformProduct), error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async bulkUpdatePrices(productIds: string[], priceField: 'pret_cost' | 'pret_offline' | 'pret_online', percentage: number): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('user_id', user.id);

      if (fetchError) return { error: fetchError };
      if (!products) return { error: { message: 'No products found' } };

      for (const product of products) {
        const currentPrice = product[priceField];
        if (currentPrice !== null) {
          const newPrice = currentPrice * (1 + percentage / 100);
          await supabase
            .from('products')
            .update({ [priceField]: newPrice })
            .eq('id', product.id)
            .eq('user_id', user.id);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async importProductsFromCSV(csvData: CreateProductInput[]): Promise<{ error: any; imported: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' }, imported: 0 };
      }

      const companyId = await this.getUserCompanyId();

      const productsToInsert = csvData.map(product => ({
        user_id: user.id,
        company_id: companyId,
        product_id: product.product_id,
        nume: product.nume,
        category_id: product.category_id,
        cantitate: product.cantitate || null,
        pret_cost: product.pret_cost,
        pret_offline: product.pret_offline ?? null,
        pret_online: product.pret_online ?? null,
        is_active: true
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      return { error, imported: error ? 0 : productsToInsert.length };
    } catch (error) {
      return { error, imported: 0 };
    }
  }

  async exportProductsToCSV(): Promise<{ data: string | null; error: any }> {
    try {
      const { data: products, error } = await this.getProducts();
      
      if (error || !products) {
        return { data: null, error };
      }

      const headers = ['product_id', 'nume', 'cantitate', 'pret_cost', 'pret_offline', 'pret_online', 'category_id'];
      const csvRows = [
        headers.join(','),
        ...products.map(p => 
          headers.map(h => {
            const value = p[h as keyof Product];
            return value !== null && value !== undefined ? `"${value}"` : '';
          }).join(',')
        )
      ];

      return { data: csvRows.join('\n'), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const productService = new ProductService();