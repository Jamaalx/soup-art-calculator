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
  garnitura: {
    key: 'garnitura',
    label: 'Garnituri',
    icon: '🥔',
    color: '#9eff55',
    description: 'Garnituri și acompaniamente'
  },
  salate: {
    key: 'salate',
    label: 'Salate',
    icon: '🥗',
    color: '#98FB98',
    description: 'Salate și murături'
  },
  desert: {
    key: 'desert',
    label: 'Deserturi',
    icon: '🍰',
    color: '#FFB6C1',
    description: 'Deserturi și prăjituri'
  },
  placinte: {
    key: 'placinte',
    label: 'Plăcinte',
    icon: '🥧',
    color: '#DDA0DD',
    description: 'Plăcinte tradiționale'
  },
  auxiliare: {
    key: 'auxiliare',
    label: 'Auxiliare',
    icon: '🍞',
    color: '#EBEBEB',
    description: 'Sosuri, pâine, și accesorii'
  },
  bauturi: {
    key: 'bauturi',
    label: 'Băuturi',
    icon: '🥤',
    color: '#87CEEB',
    description: 'Băuturi răcoritoare și bere'
  },
  vinuri: {
    key: 'vinuri',
    label: 'Vinuri & Miniaturi',
    icon: '🍷',
    color: '#DEB887',
    description: 'Vinuri și băuturi alcoolice'
  }
};

export const getCategoryColor = (category: ProductCategory): string => {
  return CATEGORIES[category]?.color || '#EBEBEB';
};

export const getCategoryIcon = (category: ProductCategory): string => {
  return CATEGORIES[category]?.icon || '📦';
};

export const getCategoryLabel = (category: ProductCategory): string => {
  return CATEGORIES[category]?.label || category;
};