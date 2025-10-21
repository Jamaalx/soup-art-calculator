import { useState, useEffect } from 'react';
import { Competitor, CompetitorProduct, PriceComparison } from '@/types';
import { competitorService } from '@/lib/services/competitorService';

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      const data = await competitorService.getCompetitors();
      setCompetitors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitors');
    } finally {
      setLoading(false);
    }
  };

  const createCompetitor = async (competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCompetitor = await competitorService.createCompetitor(competitor);
      setCompetitors([newCompetitor, ...competitors]);
      return newCompetitor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competitor');
      throw err;
    }
  };

  const updateCompetitor = async (id: string, updates: Partial<Competitor>) => {
    try {
      const updatedCompetitor = await competitorService.updateCompetitor(id, updates);
      setCompetitors(competitors.map(c => c.id === id ? updatedCompetitor : c));
      return updatedCompetitor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update competitor');
      throw err;
    }
  };

  const deleteCompetitor = async (id: string) => {
    try {
      await competitorService.deleteCompetitor(id);
      setCompetitors(competitors.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete competitor');
      throw err;
    }
  };

  return {
    competitors,
    loading,
    error,
    createCompetitor,
    updateCompetitor,
    deleteCompetitor,
    refresh: loadCompetitors
  };
}

export function useCompetitorProducts(competitorId?: string) {
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (competitorId) {
      loadProducts();
    }
  }, [competitorId]);

  const loadProducts = async () => {
    if (!competitorId) return;

    try {
      setLoading(true);
      const data = await competitorService.getCompetitorProducts(competitorId);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitor products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<CompetitorProduct, 'id'>) => {
    try {
      const newProduct = await competitorService.addCompetitorProduct(product);
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProductPrice = async (id: string, price: number) => {
    try {
      const updatedProduct = await competitorService.updateCompetitorProductPrice(id, price);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await competitorService.deleteCompetitorProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const bulkImportPrices = async (importData: Array<{
    product_name: string;
    category: string;
    price: number;
    description?: string;
  }>) => {
    if (!competitorId) throw new Error('No competitor selected');

    try {
      const importedProducts = await competitorService.bulkImportPrices(competitorId, importData);
      setProducts([...products, ...importedProducts]);
      return importedProducts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import prices');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProductPrice,
    deleteProduct,
    bulkImportPrices,
    refresh: loadProducts
  };
}

export function usePriceComparison(category?: string) {
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisons();
  }, [category]);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const data = await competitorService.getPriceComparison(category);
      setComparisons(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load price comparisons');
    } finally {
      setLoading(false);
    }
  };

  return {
    comparisons,
    loading,
    error,
    refresh: loadComparisons
  };
}

export function useMarketInsights() {
  const [insights, setInsights] = useState<{
    totalCompetitors: number;
    totalTrackedProducts: number;
    avgPriceDifference: number;
    priceAdvantage: number;
    competitorsByType: Record<string, number>;
    recentPriceUpdates: CompetitorProduct[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await competitorService.getMarketInsights();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market insights');
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    loading,
    error,
    refresh: loadInsights
  };
}