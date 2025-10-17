// Product Categories
export type ProductCategory = 
  | 'ciorbe'
  | 'felPrincipal'
  | 'desert'
  | 'auxiliare'
  | 'placinte'
  | 'bauturi'
  | 'vinuri';

// Product Interface
export interface Product {
  id: string;
  nume: string;
  cantitate: string;
  pretCost: number;        // Our actual cost
  pretOffline: number;     // Selling price in restaurant
  pretOnline: number;      // Selling price on delivery apps
  category: ProductCategory;
  isActive: boolean;
}

// Menu Type
export type MenuType = 'online' | 'offline';

// Menu Configuration
export interface MenuConfig {
  type: MenuType;
  pretVanzare: number;
  selectedProducts: {
    ciorba?: Product;
    felPrincipal?: Product;
    desert?: Product;
    bautura?: Product;
    vin?: Product;
    auxiliar?: Product;
    placinta?: Product;
  };
}

// Single Simulation Result
export interface MenuSimulation {
  id: string;
  ciorba: string;
  felPrincipal: string;
  garnitura?: string;
  desert?: string;
  bautura?: string;
  costProduse: number;
  costAmbalaj: number;
  comision: number;
  costTotal: number;
  profit: number;
  marjaProfit: number;
  pretIndividual: number;
  economie: number;
  isValid: boolean;
}

// Calculation Result
export interface MenuCalculation {
  pretVanzare: number;
  costProduse: number;
  costAmbalaj: number;
  comision: number;
  comisionPercentage: number;
  costTotal: number;
  profit: number;
  marjaProfit: number;
  pretIndividual: number;
  economie: number;
  isValid: boolean;
}

// Statistics
export interface MenuStatistics {
  totalCombinations: number;
  costMin: number;
  costMax: number;
  costMediu: number;
  profitMediu: number;
  marjaMin: number;
  marjaMax: number;
  marjaMedie: number;
  profitabile: number;
  economic: number;
  mediu: number;
  premium: number;
}

// User Roles
export type UserRole = 'admin' | 'user';

// User Interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Category Metadata
export interface CategoryMetadata {
  key: ProductCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}