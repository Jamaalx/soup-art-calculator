// Business Rules & Constants

export const MENU_COSTS = {
  ONLINE: {
    PACKAGING_PER_MENU: 3.00,        // LEI per menu
    COMMISSION_PERCENTAGE: 36.3,      // % of sale price
    MIN_PRICE: 20,
    MAX_PRICE: 100,
    STEP: 0.5
  },
  OFFLINE: {
    PACKAGING_PER_MENU: 0,           // No packaging in restaurant
    COMMISSION_PERCENTAGE: 0,         // No commission
    MIN_PRICE: 0,
    MAX_PRICE: 100,
    STEP: 0.5
  }
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const PROFIT_THRESHOLDS = {
  EXCELLENT: 100,    // >= 100% margin
  GOOD: 80,          // >= 80% margin
  ACCEPTABLE: 50,    // >= 50% margin
  LOW: 30,           // >= 30% margin
  UNPROFITABLE: 0    // < 0% (loss)
} as const;

export const COST_CATEGORIES = {
  ECONOMIC: { max: 15, label: 'ECONOMIC', color: '#9eff55' },
  MEDIU: { min: 15, max: 20, label: 'MEDIU', color: '#FFC857' },
  PREMIUM: { min: 20, label: 'PREMIUM', color: '#BBDCFF' }
} as const;

export const PRICING_STRATEGIES = {
  CONSERVATIVE: { multiplier: 2.2, label: 'CONSERVATOR', desc: 'MARJĂ ~120%' },
  OPTIMAL: { multiplier: 2.0, label: 'OPTIM', desc: 'MARJĂ ~100%' },
  COMPETITIVE: { multiplier: 1.8, label: 'COMPETITIV', desc: 'MARJĂ ~80%' }
} as const;

export const BRAND = {
  name: 'CLIENTII ZED-ZEN',
  website: 'www.zed-zen.com',
  email: 'hello@zed-zen.com',
  tagline: 'Optimizare prețuri pentru restaurante'
} as const;