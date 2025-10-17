import { CategoryMetadata, ProductCategory } from '../../types';

export const CATEGORIES: Record<ProductCategory, CategoryMetadata> = {
  ciorbe: {
    key: 'ciorbe',
    label: 'Ciorbe',
    icon: '🍲',
    color: '#FFC857',
    description: 'Ciorbe și supe tradiționale'
  },
  felPrincipal: {
    key: 'felPrincipal',
    label: 'Feluri Principale',
    icon: '🍖',
    color: '#BBDCFF',
    description: 'Feluri principale de carne'
  },
  garnituri: {
    key: 'garnituri',
    label: 'Garnituri',
    icon: '🥔',
    color: '#9eff55',
    description: 'Garnituri și acompaniamente'
  },
  desert: {
    key: 'desert',
    label: 'Desert',
    icon: '🍰',
    color: '#FFB6C1',
    description: 'Deserturi și dulciuri'
  },
  salate: {
    key: 'salate',
    label: 'Salate',
    icon: '🥗',
    color: '#90EE90',
    description: 'Salate și aperitive'
  },
  bauturi: {
    key: 'bauturi',
    label: 'Băuturi',
    icon: '🥤',
    color: '#87CEEB',
    description: 'Băuturi răcoritoare și sucuri'
  },
  vinuri: {
    key: 'vinuri',
    label: 'Vinuri',
    icon: '🍷',
    color: '#DDA0DD',
    description: 'Vinuri roșii și albe'
  },
  auxiliare: {
    key: 'auxiliare',
    label: 'Auxiliare',
    icon: '🍞',
    color: '#F5DEB3',
    description: 'Pâine și produse auxiliare'
  },
  placinte: {
    key: 'placinte',
    label: 'Plăcinte',
    icon: '🥧',
    color: '#FFE4B5',
    description: 'Plăcinte tradiționale'
  }
};

// Helper functions
export function getCategoryMetadata(category: ProductCategory): CategoryMetadata {
  return CATEGORIES[category];
}

export function getCategoryIcon(category: ProductCategory): string {
  return CATEGORIES[category]?.icon || '📦';
}

export function getCategoryLabel(category: ProductCategory): string {
  return CATEGORIES[category]?.label || category;
}

export function getCategoryColor(category: ProductCategory): string {
  return CATEGORIES[category]?.color || '#EBEBEB';
}