import { createClient } from '@/lib/supabase/client';
import { Competitor, CompetitorProduct, PriceComparison, Product } from '@/types';

const supabase = createClient();

export const competitorService = {
  // Get all competitors for the current company
  async getCompetitors(): Promise<Competitor[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('company_id', profile?.company_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single competitor
  async getCompetitor(id: string): Promise<Competitor | null> {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new competitor
  async createCompetitor(competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>): Promise<Competitor> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const { data, error } = await supabase
      .from('competitors')
      .insert({
        ...competitor,
        company_id: profile?.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update competitor
  async updateCompetitor(id: string, updates: Partial<Competitor>): Promise<Competitor> {
    const { data, error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete competitor (soft delete)
  async deleteCompetitor(id: string): Promise<void> {
    const { error } = await supabase
      .from('competitors')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Get competitor products
  async getCompetitorProducts(competitorId: string): Promise<CompetitorProduct[]> {
    const { data, error } = await supabase
      .from('competitor_products')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('product_name');

    if (error) throw error;
    return data || [];
  },

  // Add competitor product
  async addCompetitorProduct(product: Omit<CompetitorProduct, 'id'>): Promise<CompetitorProduct> {
    const { data, error } = await supabase
      .from('competitor_products')
      .insert({
        ...product,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update competitor product price
  async updateCompetitorProductPrice(id: string, price: number): Promise<CompetitorProduct> {
    const { data, error } = await supabase
      .from('competitor_products')
      .update({ 
        price,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete competitor product
  async deleteCompetitorProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('competitor_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get price comparison for a specific category
  async getPriceComparison(category?: string): Promise<PriceComparison[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    // Get our products
    let ourProductsQuery = supabase
      .from('products')
      .select('*')
      .eq('company_id', profile?.company_id)
      .eq('is_active', true);

    if (category) {
      ourProductsQuery = ourProductsQuery.eq('category', category);
    }

    const { data: ourProducts, error: ourError } = await ourProductsQuery;
    if (ourError) throw ourError;

    // Get competitor products
    let competitorQuery = supabase
      .from('competitor_products')
      .select(`
        *,
        competitors!inner(name, company_id)
      `)
      .eq('competitors.company_id', profile?.company_id);

    if (category) {
      competitorQuery = competitorQuery.eq('category', category);
    }

    const { data: competitorProducts, error: compError } = await competitorQuery;
    if (compError) throw compError;

    // Build price comparisons
    const comparisons: PriceComparison[] = [];

    ourProducts?.forEach(product => {
      const competingProducts = competitorProducts?.filter(cp => 
        cp.category === product.category &&
        (cp.product_name.toLowerCase().includes(product.nume.toLowerCase()) ||
         product.nume.toLowerCase().includes(cp.product_name.toLowerCase()))
      ) || [];

      if (competingProducts.length > 0) {
        const ourPrice = product.pret_offline || product.pret_online || product.pret_cost;
        const competitorPrices = competingProducts.map(cp => ({
          competitor_name: cp.competitors.name,
          price: cp.price,
          difference: ourPrice - cp.price,
          difference_percent: ((ourPrice - cp.price) / cp.price) * 100
        }));

        const marketAverage = competitorPrices.reduce((sum, cp) => sum + cp.price, 0) / competitorPrices.length;
        
        let ourPosition: 'below' | 'average' | 'above' = 'average';
        if (ourPrice < marketAverage * 0.95) ourPosition = 'below';
        else if (ourPrice > marketAverage * 1.05) ourPosition = 'above';

        comparisons.push({
          product_name: product.nume,
          our_price: ourPrice,
          competitor_prices: competitorPrices,
          market_average: marketAverage,
          our_position: ourPosition
        });
      }
    });

    return comparisons;
  },

  // Get market insights
  async getMarketInsights(): Promise<{
    totalCompetitors: number;
    totalTrackedProducts: number;
    avgPriceDifference: number;
    priceAdvantage: number; // % of products where we're cheaper
    competitorsByType: Record<string, number>;
    recentPriceUpdates: CompetitorProduct[];
  }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    // Get competitors
    const { data: competitors } = await supabase
      .from('competitors')
      .select('*')
      .eq('company_id', profile?.company_id)
      .eq('is_active', true);

    // Get all competitor products
    const { data: competitorProducts } = await supabase
      .from('competitor_products')
      .select(`
        *,
        competitors!inner(name, type, company_id)
      `)
      .eq('competitors.company_id', profile?.company_id)
      .order('last_updated', { ascending: false });

    // Get price comparisons
    const priceComparisons = await this.getPriceComparison();

    // Calculate insights
    const totalCompetitors = competitors?.length || 0;
    const totalTrackedProducts = competitorProducts?.length || 0;
    
    const avgPriceDifference = priceComparisons.length > 0
      ? priceComparisons.reduce((sum, pc) => {
          const avgCompPrice = pc.competitor_prices.reduce((s, cp) => s + cp.price, 0) / pc.competitor_prices.length;
          return sum + (pc.our_price - avgCompPrice);
        }, 0) / priceComparisons.length
      : 0;

    const priceAdvantage = priceComparisons.length > 0
      ? (priceComparisons.filter(pc => pc.our_position === 'below').length / priceComparisons.length) * 100
      : 0;

    const competitorsByType = competitors?.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const recentPriceUpdates = competitorProducts?.slice(0, 10) || [];

    return {
      totalCompetitors,
      totalTrackedProducts,
      avgPriceDifference,
      priceAdvantage,
      competitorsByType,
      recentPriceUpdates
    };
  },

  // Bulk import competitor prices (from CSV or manual entry)
  async bulkImportPrices(competitorId: string, products: Array<{
    product_name: string;
    category: string;
    price: number;
    description?: string;
  }>): Promise<CompetitorProduct[]> {
    const insertData = products.map(product => ({
      competitor_id: competitorId,
      ...product,
      last_updated: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('competitor_products')
      .insert(insertData)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Get pricing trends for a specific product
  async getPricingTrends(productName: string, days: number = 30): Promise<Array<{
    competitor_name: string;
    price_history: Array<{ date: string; price: number; }>;
  }>> {
    // Note: This would require a price_history table for full implementation
    // For now, we'll return current prices as a single data point
    const { data: competitorProducts } = await supabase
      .from('competitor_products')
      .select(`
        *,
        competitors!inner(name)
      `)
      .ilike('product_name', `%${productName}%`)
      .order('last_updated', { ascending: false });

    return competitorProducts?.map(cp => ({
      competitor_name: cp.competitors.name,
      price_history: [{
        date: cp.last_updated,
        price: cp.price
      }]
    })) || [];
  }
};