// src/types/index.ts

export type ProductCategory = 
  | 'ciorbe' 
  | 'felPrincipal' 
  | 'garnituri' 
  | 'desert' 
  | 'salate'
  | 'bauturi' 
  | 'vinuri'
  | 'auxiliare' 
  | 'placinte';

// Category Metadata for UI display
export interface CategoryMetadata {
  key: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface Product {
  id: string;
  nume: string;
  cantitate: string;        // "200 gr", "250 ml", etc.
  pretCost: number;         // Cost price
  pretOffline: number;      // Offline/restaurant selling price
  pretOnline: number;       // Online/delivery selling price
  category: ProductCategory;
  isActive: boolean;
  
  // Sales data for analytics
  salesOffline?: number;    // Monthly sales count offline
  salesOnline?: number;     // Monthly sales count online
  popularity?: number;      // Calculated popularity score (0-100)
}

export interface UserProduct extends Product {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fixed Menu Combo Type
export interface FixedMenuCombo {
  id: string;
  name: string;              // "Combo 1", "Meniu Economic", etc.
  products: {
    category: ProductCategory;
    productId: string;
    productName: string;
  }[];
  totalCost: number;
  individualPrice: number;   // Sum of individual prices
  comboPrice: number;        // User-set combo price
  profit: number;
  marjaProfit: number;
  discount: number;          // Amount saved
  discountPercent: number;   // Percentage saved
}

// Variable Menu Configuration
export interface VariableMenuConfig {
  id: string;
  name: string;
  categories: {
    category: ProductCategory;
    productIds: string[];    // Selected products for this category
  }[];
  generatedCombinations?: MenuCombination[];
}

export interface MenuCombination {
  products: {
    category: ProductCategory;
    productId: string;
    productName: string;
    price: number;
  }[];
  totalCost: number;
  totalPrice: number;
  profit: number;
  marjaProfit: number;
}

// Existing Simulation Types
export interface Simulation {
  ciorba: string;
  felPrincipal: string;
  garnitura: string;
  costTotal: number;
  profit: number;
  marjaProfit: number;
}

export interface MenuOfflineSimulation {
  ciorba: string;
  felPrincipal: string;
  garnitura: string;
  costProduse: number;
  pretIndividual: number;
  pretMeniu: number;
  economie: number;
  economieProcentuala: number;
}

export interface MenuFixSimulation {
  felPrincipal: string;
  garnitura: string;
  costProduse: number;
  pretMeniu: number;
  economie: number;
  economieProcentuala: number;
}

export interface MenuCateringSimulation {
  ciorba?: string;
  felPrincipal: string;
  garnitura: string;
  desert?: string;
  bautura?: string;
  auxiliare?: string[];
  costTotal: number;
  pretMeniu: number;
  profit: number;
  marjaProfit: number;
  items: string[];
}

// Analytics Types
export interface ProductAnalytics {
  product: Product;
  totalSales: number;
  revenue: number;
  profit: number;
  marginPercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SalesForcast {
  month: string;
  predictedSales: number;
  confidence: number;
}

export interface SurveyData {
  month: string;
  productId: string;
  salesCount: number;
  userId: string;
}

// Calculation Settings
export interface CalculationSettings {
  pretVanzare: number;
  costuriFix: number;
  marjaDorita: number;
  includeDesert?: boolean;
  includeBautura?: boolean;
}

export interface CalculationResult {
  id: string;
  userId: string;
  calculationType: 'online' | 'offline' | 'catering';
  menuType: 'fix' | 'variabil' | 'standard';
  settings: CalculationSettings;
  results: Simulation[] | MenuOfflineSimulation[] | MenuCateringSimulation[] | FixedMenuCombo[];
  createdAt: string;
}

// User Type
export interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  createdAt: string;
}