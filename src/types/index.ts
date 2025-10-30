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
  cantitate?: string | null;
  pret_cost: number;
  pret_offline?: number | null;
  pret_online?: number | null;
  is_active: boolean;
  pretCost: number;
  pretOffline?: number;
  pretOnline?: number;
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

// Fixed Menu Combo - UPDATED WITH NEW FIELDS
export interface FixedMenuCombo {
  id: string;
  name: string;
  products: Array<{
    category: ProductCategory;
    productId: string;
    productName: string;
  }>;
  foodCost: number;                    // NEW: Separate food cost
  totalCost: number;
  individualPrice: number;
  comboPrice: number;
  priceAfterDiscount: number;          // NEW: Price customer actually pays
  discountAmount: number;              // NEW: Discount amount in LEI
  commissionAmount: number;            // NEW: App commission amount
  profit: number;
  marjaProfit: number;
  customerDiscount: number;            // Renamed from 'discount'
  customerDiscountPercent: number;     // Renamed from 'discountPercent'
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

// Menu Combination (for variations calculator) - UPDATED WITH NEW FIELDS
export interface MenuCombination {
  products: Product[];
  costTotal: number;
  pretIndividual: number;
  pretMeniu: number;
  priceAfterDiscount: number;          // NEW: Price customer actually pays
  discountAmount: number;              // NEW: Discount amount in LEI
  commissionAmount: number;            // NEW: App commission amount
  profit: number;
  marjaProfit: number;
  discount: number;                    // Customer savings vs individual prices
  discountPercent: number;             // Customer savings percentage
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

// Recipe & FoodCost Types
export interface Ingredient {
  id: string;
  name: string;
  unit: string; // Can be any unit from the units table
  cost_per_unit: number;
  supplier_id?: string | null;
  category: string;
  brand?: string | null;
  purchase_location?: string | null;
  notes?: string | null;
  is_active: boolean | null;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface IngredientPriceHistory {
  id: string;
  ingredient_id: string;
  old_price: number;
  new_price: number;
  price_change: number;
  price_change_percent: number;
  change_reason?: string | null;
  supplier_id?: string | null;
  purchase_location?: string | null;
  recorded_at: string;
  company_id: string;
  created_at?: string;
}

export interface IngredientPriceInsights {
  ingredient_id: string;
  ingredient_name: string;
  current_price: number;
  price_history: IngredientPriceHistory[];
  price_trend: 'increasing' | 'decreasing' | 'stable';
  total_change_percent: number;
  average_monthly_change: number;
  highest_price: { price: number; date: string; };
  lowest_price: { price: number; date: string; };
  last_updated: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  ingredient_name?: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  ingredients?: RecipeIngredient[]; // Joined from recipe_ingredients table
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  serving_size: number;
  difficulty_level?: string;
  instructions?: string | null;
  notes?: string | null;
  total_cost?: number; // Calculated field
  cost_per_serving?: number; // Calculated field
  selling_price?: number; // Calculated field
  profit_margin?: number; // Calculated field
  is_active: boolean;
  company_id: string;
  product_id?: string | null; // Link to product (if exists in extended schema)
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields (map to database fields)
  preparation_time?: number; // maps to prep_time_minutes
  servings?: number; // maps to serving_size
}

// Competitor Analysis Types
export interface Competitor {
  id: string;
  name: string;
  website?: string | null;
  location?: string | null;
  category?: string | null; // Database field (maps to type)
  type?: 'restaurant' | 'delivery' | 'both'; // Legacy/display field
  price_range?: string | null; // Can be 'budget' | 'medium' | 'premium'
  phone?: string | null;
  notes?: string | null;
  is_active: boolean;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompetitorProduct {
  id: string;
  competitor_id: string;
  name: string; // Database field name
  product_name?: string; // Legacy/display field (maps to name)
  category?: string | null;
  price: number;
  description?: string | null;
  notes?: string | null;
  source?: string | null;
  date_recorded?: string | null;
  updated_at?: string; // Database field
  last_updated?: string; // Legacy/display field (maps to updated_at)
  is_active?: boolean;
  our_equivalent_product_id?: string;
}

export interface PriceComparison {
  product_name: string;
  our_price: number;
  competitor_prices: Array<{
    competitor_name: string;
    price: number;
    difference: number;
    difference_percent: number;
  }>;
  market_average: number;
  our_position: 'below' | 'average' | 'above';
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  delivery_days?: string[];
  minimum_order?: number;
  payment_terms?: string;
  is_active: boolean;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_name: string;
  unit: string;
  price: number;
  minimum_quantity?: number;
  description?: string;
  last_price_update?: string;
}

export interface Order {
  id: string;
  supplier_id: string;
  order_date: string;
  delivery_date?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
}

// Financial Types
export interface BreakevenData {
  fixed_costs: number;
  variable_cost_per_unit: number;
  selling_price_per_unit: number;
  breakeven_quantity: number;
  breakeven_revenue: number;
  current_quantity?: number;
  profit_at_current?: number;
}

export interface Budget {
  id: string;
  month: string;
  year: number;
  categories: BudgetCategory[];
  total_budget: number;
  total_spent: number;
  variance: number;
  company_id: string;
}

export interface BudgetCategory {
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  variance_percent: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  parameters: {
    sales_change_percent?: number;
    cost_change_percent?: number;
    price_change_percent?: number;
    customer_count_change?: number;
  };
  results: {
    revenue: number;
    costs: number;
    profit: number;
    profit_margin: number;
  };
  created_at?: string;
}

// Report Types
export interface WeeklyReport {
  week_number: number;
  start_date: string;
  end_date: string;
  revenue: number;
  costs: number;
  profit: number;
  top_products: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  key_metrics: {
    average_order_value: number;
    food_cost_percentage: number;
    labor_cost_percentage: number;
  };
}

export interface MenuPerformance {
  product_id: string;
  product_name: string;
  category: string;
  units_sold: number;
  revenue: number;
  food_cost: number;
  profit: number;
  profit_margin: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FinancialReport {
  id: string;
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period_start: string;
  period_end: string;
  generated_at: string;
  data: {
    total_revenue: number;
    total_costs: number;
    total_profit: number;
    profit_margin: number;
    cost_breakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    revenue_by_category: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    top_performing_products: Array<{
      name: string;
      revenue: number;
      profit: number;
      units_sold: number;
    }>;
    kpis: {
      average_order_value: number;
      customer_count: number;
      average_spend_per_customer: number;
      food_cost_percentage: number;
      labor_cost_percentage: number;
      profit_per_day: number;
    };
  };
  company_id: string;
}

export interface SalesReport {
  period: {
    start: string;
    end: string;
    type: 'daily' | 'weekly' | 'monthly';
  };
  summary: {
    total_sales: number;
    total_orders: number;
    average_order_value: number;
    growth_rate: number;
  };
  products: MenuPerformance[];
  categories: Array<{
    name: string;
    sales: number;
    orders: number;
    growth: number;
  }>;
  trends: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface CostReport {
  period: {
    start: string;
    end: string;
  };
  total_costs: number;
  cost_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    previous_period: number;
    change: number;
  }>;
  cost_per_unit_metrics: {
    food_cost_per_meal: number;
    labor_cost_per_meal: number;
    overhead_cost_per_meal: number;
  };
  suppliers: Array<{
    name: string;
    total_spent: number;
    order_count: number;
    average_order_value: number;
  }>;
  recommendations: string[];
}

export interface InventoryReport {
  generated_at: string;
  ingredients: Array<{
    name: string;
    current_stock: number;
    unit: string;
    value: number;
    usage_rate: number;
    days_remaining: number;
    reorder_needed: boolean;
  }>;
  low_stock_alerts: Array<{
    ingredient: string;
    current_stock: number;
    minimum_required: number;
    supplier: string;
  }>;
  waste_analysis: Array<{
    ingredient: string;
    waste_amount: number;
    waste_value: number;
    waste_percentage: number;
  }>;
  total_inventory_value: number;
}

export interface CompetitorReport {
  period: {
    start: string;
    end: string;
  };
  market_analysis: {
    average_market_price: number;
    price_position: 'below' | 'at' | 'above';
    competitive_advantage: string[];
  };
  competitor_comparison: Array<{
    competitor_name: string;
    product_matches: number;
    average_price_difference: number;
    strength_areas: string[];
  }>;
  pricing_opportunities: Array<{
    product: string;
    current_price: number;
    suggested_price: number;
    potential_increase: number;
    market_justification: string;
  }>;
}

export type ReportType = 'financial' | 'sales' | 'cost' | 'inventory' | 'competitor' | 'menu-performance';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ExportFormatType = 'pdf' | 'excel' | 'csv' | 'json';

// Menu Export Types
export interface MenuExportFormat {
  type: 'csv' | 'pdf' | 'excel' | 'json';
  template: 'glovo' | 'bolt' | 'tazz' | 'uber' | 'foodpanda' | 'standard';
}

export interface ExportableProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
  allergens?: string[];
  ingredients?: string[];
  nutrition_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  availability: {
    available: boolean;
    start_time?: string;
    end_time?: string;
    days_of_week?: string[];
  };
  delivery_platforms: {
    glovo: boolean;
    bolt: boolean;
    tazz: boolean;
    uber: boolean;
    foodpanda: boolean;
  };
  platform_specific_pricing?: {
    glovo?: number;
    bolt?: number;
    tazz?: number;
    uber?: number;
    foodpanda?: number;
  };
}

export interface MenuExportTemplate {
  platform: 'glovo' | 'bolt' | 'tazz' | 'uber' | 'foodpanda' | 'standard';
  name: string;
  description: string;
  required_fields: string[];
  optional_fields: string[];
  field_mappings: Record<string, string>;
  formatting_rules: {
    price_format: string;
    currency: string;
    decimal_places: number;
    thousand_separator: string;
    category_separator?: string;
  };
  validation_rules: {
    max_name_length?: number;
    max_description_length?: number;
    required_image?: boolean;
    price_range?: { min: number; max: number; };
  };
}

export interface MenuExportJob {
  id: string;
  name: string;
  platform: string;
  format: 'csv' | 'pdf' | 'excel' | 'json';
  products: ExportableProduct[];
  template: MenuExportTemplate;
  filters: {
    categories?: string[];
    price_range?: { min: number; max: number; };
    availability_only?: boolean;
    platform_enabled_only?: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string;
  company_id: string;
}

export interface PlatformIntegration {
  platform: 'glovo' | 'bolt' | 'tazz' | 'uber' | 'foodpanda';
  enabled: boolean;
  api_credentials?: {
    api_key: string;
    restaurant_id: string;
    environment: 'sandbox' | 'production';
  };
  sync_settings: {
    auto_sync: boolean;
    sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    sync_products: boolean;
    sync_prices: boolean;
    sync_availability: boolean;
  };
  last_sync?: string;
  company_id: string;
}

export interface SeasonalMenu {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  products: string[];
  active_from: string;
  active_to: string;
  is_active: boolean;
  auto_activate: boolean;
  export_platforms: string[];
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BulkMenuOperation {
  id: string;
  operation_type: 'export' | 'import' | 'update' | 'sync';
  platform?: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  results: {
    success_count: number;
    error_count: number;
    warnings: string[];
    errors: string[];
  };
  created_at: string;
  completed_at?: string;
  company_id: string;
}

export type ExportPlatform = 'glovo' | 'bolt' | 'tazz' | 'uber' | 'foodpanda' | 'all';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';