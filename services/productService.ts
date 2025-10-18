// services/productService.ts
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/hooks/useProducts';

const supabase = createClient();

export interface CreateProductInput {
  product_id: string;
  nume: string;
  cantitate?: string;
  pret_cost: number;
  pret_offline?: number;
  pret_online?: number;
  category: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  is_active?: boolean;
}

class ProductService {
  // Create a new product
  async createProduct(input: CreateProductInput): Promise<{ data: Product | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            ...input,
            is_active: true
          }
        ])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update a product
  async updateProduct(
    productId: string, 
    updates: UpdateProductInput
  ): Promise<{ data: Product | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .eq('user_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete a product (soft delete)
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

  // Permanently delete a product
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

  // Get all products for current user
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
        .order('category')
        .order('nume');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('is_active', true)
        .order('nume');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Bulk update prices
  async bulkUpdatePrices(
    productIds: string[],
    priceField: 'pret_cost' | 'pret_offline' | 'pret_online',
    percentage: number
  ): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Get current products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('user_id', user.id);

      if (fetchError) return { error: fetchError };

      // Calculate new prices
      const updates = products?.map(product => ({
        id: product.id,
        [priceField]: product[priceField] * (1 + percentage / 100)
      }));

      // Update all products
      if (updates) {
        for (const update of updates) {
          await supabase
            .from('products')
            .update({ [priceField]: update[priceField] })
            .eq('id', update.id)
            .eq('user_id', user.id);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Import products from CSV
  async importProductsFromCSV(csvData: CreateProductInput[]): Promise<{ error: any; imported: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' }, imported: 0 };
      }

      const productsToInsert = csvData.map(product => ({
        user_id: user.id,
        ...product,
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

  // Export products to CSV format
  async exportProductsToCSV(): Promise<{ data: string | null; error: any }> {
    try {
      const { data: products, error } = await this.getProducts();
      
      if (error || !products) {
        return { data: null, error };
      }

      // Convert to CSV
      const headers = ['product_id', 'nume', 'cantitate', 'pret_cost', 'pret_offline', 'pret_online', 'category'];
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