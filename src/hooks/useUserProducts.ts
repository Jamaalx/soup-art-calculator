// src/hooks/useUserProducts.ts
import { useMemo } from 'react';
import { 
  CIORBE, 
  FELPRINCIPAL, 
  GARNITURI, 
  DESERT, 
  BAUTURI, 
  AUXILIARE, 
  PLACINTE 
} from '@/lib/data/products';
import type { Product, ProductCategory } from '@/types';

/**
 * Hook to get user products by category
 * Currently returns static data from TypeScript files
 * TODO: Add database integration for multi-user support
 */
export function useUserProducts() {
  const products = useMemo(() => {
    return {
      ciorbe: CIORBE,
      felPrincipal: FELPRINCIPAL,
      garnituri: GARNITURI,
      desert: DESERT,
      bauturi: BAUTURI,
      auxiliare: AUXILIARE,
      placinte: PLACINTE,
      all: [
        ...CIORBE,
        ...FELPRINCIPAL,
        ...GARNITURI,
        ...DESERT,
        ...BAUTURI,
        ...AUXILIARE,
        ...PLACINTE
      ]
    };
  }, []);

  const getProductsByCategory = (category: ProductCategory): Product[] => {
    switch(category) {
      case 'ciorbe':
        return products.ciorbe;
      case 'felPrincipal':
        return products.felPrincipal;
      case 'garnituri':
        return products.garnituri;
      case 'desert':
        return products.desert;
      case 'bauturi':
        return products.bauturi;
      case 'auxiliare':
        return products.auxiliare;
      case 'placinte':
        return products.placinte;
      default:
        return [];
    }
  };

  return {
    products,
    getProductsByCategory,
    loading: false,
    error: null
  };
}