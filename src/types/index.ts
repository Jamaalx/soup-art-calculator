// src/types/index.ts

// DYNAMIC: Categories come from database, no hardcoded values
export type ProductCategory = string;

// FIXED: Match the Product type from productService.ts
export interface Product {
  id: string;
  product_id: string;
  nume: string;
  category_id: string;
  company_id?: string | null;
  cantitate?: string | null;  // FIXED: Made optional and nullable
  pret_cost: number;
  pret_offline?: number | null;  // FIXED: Made optional and nullable
  pret_online?: number | null;   // FIXED: Made optional and nullable
  is_active: boolean;
  pretCost: number;
  pretOffline?: number;  // FIXED: Made optional
  pretOnline?: number;   // FIXED: Made optional
  category: string;
}

// Category Metadata for UI display
export interface CategoryMetadata {
  key: ProductCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// Fixed Menu Combo
export interface FixedMenuCombo {
  id: string;
  name: string;
  products: Array<{
    category: ProductCategory;
    productId: string;
    productName: string;
  }>;
  totalCost: number;
  individualPrice: number;
  comboPrice: number;
  profit: number;
  marjaProfit: number;
  discount: number;
  discountPercent: number;
}

// Variable Menu Configuration
export interface VariableMenuConfig {
  categories: ProductCategory[];
  productsPerCategory: Record<ProductCategory, string[]>; // productIds
  priceRange: {
    min: number;
    max: number;
  };
}

// Menu Combination (for variations calculator)
export interface MenuCombination {
  products: Product[];
  costTotal: number;
  pretIndividual: number;
  pretMeniu: number;
  profit: number;
  marjaProfit: number;
  discount: number;
  discountPercent: number;
}

// Simulation (legacy - keep for compatibility)
export interface Simulation {
  ciorba: string;
  felPrincipal: string;
  garnitura: string;
  costTotal: number;
  profit: number;
  marjaProfit: number;
}

// Analytics
export interface ProductAnalytics {
  productId: string;
  productName: string;
  category: ProductCategory;
  totalRevenue: number;
  averageMargin: number;
  timesUsed: number;
}

export interface CategoryAnalytics {
  category: ProductCategory;
  totalProducts: number;
  averageCost: number;
  averagePrice: number;
  mostUsed: string; // product name
}