// Export all product arrays
export { CIORBE } from './ciorbe';
export { FEL_PRINCIPAL } from './fel_Principal';
export { GARNITURI } from './garnituri';
export { SALATE } from './salate';
export { DESERT } from './desert';
export { PLACINTE } from './placinte';
export { AUXILIARE } from './auxiliare';
export { BAUTURI } from './bauturi';
export { VINURI } from './vinuri';

import { Product, ProductCategory } from '../../../types';
import { CIORBE } from './ciorbe';
import { FEL_PRINCIPAL } from './fel_Principal';
import { GARNITURI } from './garnituri';
import { SALATE } from './salate';
import { DESERT } from './desert';
import { PLACINTE } from './placinte';
import { AUXILIARE } from './auxiliare';
import { BAUTURI } from './bauturi';
import { VINURI } from './vinuri';

// All products combined
export const ALL_PRODUCTS: Product[] = [
  ...CIORBE,
  ...FEL_PRINCIPAL,
  ...GARNITURI,
  ...SALATE,
  ...DESERT,
  ...PLACINTE,
  ...AUXILIARE,
  ...BAUTURI,
  ...VINURI
];

// Get products by category
export const getProductsByCategory = (category: ProductCategory): Product[] => {
  return ALL_PRODUCTS.filter(p => p.category === category && p.isActive);
};

// Get product by ID
export const getProductById = (id: string): Product | undefined => {
  return ALL_PRODUCTS.find(p => p.id === id);
};

// Get active products
export const getActiveProducts = (): Product[] => {
  return ALL_PRODUCTS.filter(p => p.isActive);
};

// Product counts by category
export const PRODUCT_COUNTS = {
  ciorbe: CIORBE.length,
  felPrincipal: FEL_PRINCIPAL.length,
  garnituri: GARNITURI.length,
  salate: SALATE.length,
  desert: DESERT.length,
  placinte: PLACINTE.length,
  auxiliare: AUXILIARE.length,
  bauturi: BAUTURI.length,
  vinuri: VINURI.length,
  total: ALL_PRODUCTS.length
};