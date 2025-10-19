'use client';

import React, { createContext, useContext } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';

type ProductsContextType = ReturnType<typeof useProducts>;

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const productsData = useProducts();

  return (
    <ProductsContext.Provider value={productsData}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
}