import { Product } from '@/types';

// Desserts - cost prices estimated based on typical margins (need client confirmation)
export const DESERT: Product[] = [
  {
    id: 'desert-1',
    nume: 'Desertul Casei (cusma lui guguta)',
    cantitate: '250 gr',
    pretCost: 9.00, // Estimated ~45% cost
    pretOffline: 20.00,
    pretOnline: 29.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-2',
    nume: 'Tiramisu',
    cantitate: '120 gr',
    pretCost: 8.50, // Estimated
    pretOffline: 18.00,
    pretOnline: 29.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-3',
    nume: 'Cheesecake Berry (fructe de padure)',
    cantitate: '100 gr',
    pretCost: 7.50, // Estimated
    pretOffline: 16.00,
    pretOnline: 21.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-4',
    nume: 'Cheesecake cu ciocolata si caramel sarat',
    cantitate: '100 gr',
    pretCost: 8.00, // Estimated
    pretOffline: 16.00,
    pretOnline: 26.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-5',
    nume: 'Snickers',
    cantitate: '130 gr',
    pretCost: 8.50, // Estimated
    pretOffline: 18.00,
    pretOnline: 23.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-6',
    nume: 'Prajitura cu mar',
    cantitate: '100 gr',
    pretCost: 5.50, // Estimated
    pretOffline: 12.00,
    pretOnline: 18.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-7',
    nume: 'Smantanel',
    cantitate: '140 gr',
    pretCost: 7.50, // Estimated
    pretOffline: 16.00,
    pretOnline: 23.00,
    category: 'desert',
    isActive: true
  },
  {
    id: 'desert-8',
    nume: 'Tort ciocolata',
    cantitate: '110 gr',
    pretCost: 8.50, // Estimated
    pretOffline: 18.00,
    pretOnline: 23.00,
    category: 'desert',
    isActive: true
  }
];