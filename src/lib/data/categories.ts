// Category helper functions for dynamic categories from database

interface CategoryMetadata {
  icon: string;
  label: string;
  color: string;
}

// Default category metadata - can be overridden by database values
const defaultCategoryMetadata: Record<string, CategoryMetadata> = {
  // Ingredient categories
  meat: { icon: '🥩', label: 'Meat', color: '#DC2626' },
  vegetables: { icon: '🥕', label: 'Vegetables', color: '#16A34A' },
  dairy: { icon: '🥛', label: 'Dairy', color: '#3B82F6' },
  'oils-fats': { icon: '🛢️', label: 'Oils & Fats', color: '#F59E0B' },
  'spices-herbs': { icon: '🌿', label: 'Spices & Herbs', color: '#10B981' },
  'grains-cereals': { icon: '🌾', label: 'Grains & Cereals', color: '#8B5CF6' },
  seafood: { icon: '🐟', label: 'Seafood', color: '#0EA5E9' },
  fruits: { icon: '🍎', label: 'Fruits', color: '#EF4444' },
  beverages: { icon: '🥤', label: 'Beverages', color: '#6366F1' },
  other: { icon: '📦', label: 'Other', color: '#6B7280' },

  // Recipe categories
  'ciorbe-supe': { icon: '🍲', label: 'Ciorbe și Supe', color: '#DC2626' },
  'feluri-principale': { icon: '🍽️', label: 'Feluri Principale', color: '#16A34A' },
  garnituri: { icon: '🥗', label: 'Garnituri', color: '#F59E0B' },
  salate: { icon: '🥬', label: 'Salate', color: '#10B981' },
  deserturi: { icon: '🍰', label: 'Deserturi', color: '#8B5CF6' },
  bauturi: { icon: '☕', label: 'Băuturi', color: '#6366F1' },
};

// Normalize category key for lookup
function normalizeCategoryKey(category: string): string {
  return category.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get the icon for a category
 * Falls back to a default icon if category not found
 */
export function getCategoryIcon(category: string): string {
  const normalized = normalizeCategoryKey(category);
  return defaultCategoryMetadata[normalized]?.icon || '📦';
}

/**
 * Get the display label for a category
 * Falls back to the category name itself if not found
 */
export function getCategoryLabel(category: string): string {
  const normalized = normalizeCategoryKey(category);
  return defaultCategoryMetadata[normalized]?.label || category;
}

/**
 * Get the color for a category
 * Falls back to a neutral gray if not found
 */
export function getCategoryColor(category: string): string {
  const normalized = normalizeCategoryKey(category);
  return defaultCategoryMetadata[normalized]?.color || '#6B7280';
}

/**
 * Get all metadata for a category
 */
export function getCategoryMetadata(category: string): CategoryMetadata {
  const normalized = normalizeCategoryKey(category);
  return defaultCategoryMetadata[normalized] || {
    icon: '📦',
    label: category,
    color: '#6B7280'
  };
}

/**
 * Get all available category keys
 */
export function getAllCategoryKeys(): string[] {
  return Object.keys(defaultCategoryMetadata);
}
