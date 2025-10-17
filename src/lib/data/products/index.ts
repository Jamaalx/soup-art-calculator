// src/lib/data/products/index.ts
import type { Product, ProductCategory } from '../../../types';
import { CIORBE } from './ciorbe';
import { GARNITURI } from './garnituri';
import { FELPRINCIPAL } from './felPrincipal';  // Matches actual export name
import { SALATE } from './salate';
import { DESERT } from './desert';
import { PLACINTE } from './placinte';
import { AUXILIARE } from './auxiliare';
import { BAUTURI } from './bauturi';
import { VINURI } from './vinuri';

// Export all product arrays with consistent naming
export { CIORBE } from './ciorbe';
export { GARNITURI } from './garnituri';
export { SALATE } from './salate';
export { DESERT } from './desert';
export { PLACINTE } from './placinte';
export { AUXILIARE } from './auxiliare';
export { BAUTURI } from './bauturi';
export { VINURI } from './vinuri';
export { FELPRINCIPAL } from './felPrincipal';

// Combined array of all products
export const ALL_PRODUCTS: Product[] = [
  ...CIORBE,
  ...FELPRINCIPAL,
  ...GARNITURI,
  ...SALATE,
  ...DESERT,
  ...PLACINTE,
  ...AUXILIARE,
  ...BAUTURI,
  ...VINURI
];

// Helper function to get products by category
export function getProductsByCategory(category: ProductCategory): Product[] {
  switch (category) {
    case 'ciorbe':
      return CIORBE;
    case 'felPrincipal':
      return FELPRINCIPAL;
    case 'garnituri':
      return GARNITURI;
    case 'desert':
      return DESERT;
    case 'bauturi':
      return BAUTURI;
    case 'auxiliare':
      return AUXILIARE;
    case 'placinte':
      return PLACINTE;
    default:
      return [];
  }
}