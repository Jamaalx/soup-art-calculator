import { Product } from '@/types';

// Auxiliare (side items, sauces, bread, toppings)
export const AUXILIARE: Product[] = [
  {
    id: 'aux-1',
    nume: 'SOS MUJDEI',
    cantitate: '50 gr',
    pretCost: 0.50, // Estimated
    pretOffline: 1.00,
    pretOnline: 5.00,
    category: 'auxiliare',
    isActive: true,
    salesOffline: 23,
    salesOnline: 15
  },
  {
    id: 'aux-2',
    nume: 'SMANTANA',
    cantitate: '50 gr',
    pretCost: 1.50, // Estimated
    pretOffline: 3.00,
    pretOnline: 5.00,
    category: 'auxiliare',
    isActive: true
  },
  {
    id: 'aux-3',
    nume: 'CHIFLA',
    cantitate: '1 buc',
    pretCost: 0.80, // Estimated
    pretOffline: 2.00,
    pretOnline: 5.00,
    category: 'auxiliare',
    isActive: true
  },
  {
    id: 'aux-4',
    nume: 'CRUTOANE',
    cantitate: '50 gr',
    pretCost: 0.80, // Estimated
    pretOffline: 2.00,
    pretOnline: 5.00,
    category: 'auxiliare',
    isActive: true
  },
  {
    id: 'aux-5',
    nume: 'Ardei',
    cantitate: '1 buc',
    pretCost: 0.50, // Estimated
    pretOffline: 1.00,
    pretOnline: 3.00,
    category: 'auxiliare',
    isActive: true
  },
  {
    id: 'aux-6',
    nume: 'Amestec de fructe',
    cantitate: '1 kg',
    pretCost: 8.00, // Estimated
    pretOffline: 15.00,
    pretOnline: 20.00,
    category: 'auxiliare',
    isActive: true
  }
];