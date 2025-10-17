import { Product } from '@/types';

// Băuturi (drinks - sodas, water, beer, energy drinks)
// Cost estimated at ~40-50% of offline price
export const BAUTURI: Product[] = [
  {
    id: 'bautura-1',
    nume: 'Pepsi 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-2',
    nume: 'Pepsi Twist 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-3',
    nume: 'Pepsi Max 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-4',
    nume: 'Gama pepsi 0.250 ml',
    cantitate: '0,250 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-5',
    nume: 'Prigat 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-6',
    nume: 'Mirinda 0,250',
    cantitate: '0,250 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-7',
    nume: '7up 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-8',
    nume: 'Mountain Dew 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-9',
    nume: 'Lipton 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-10',
    nume: 'Everess bitter',
    cantitate: 'buc',
    pretCost: 4.00,
    pretOffline: 9.00,
    pretOnline: 13.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-11',
    nume: 'Aqua Carpatica plata 0,500',
    cantitate: '0,500 ml',
    pretCost: 3.00,
    pretOffline: 7.00,
    pretOnline: 9.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-12',
    nume: 'Aqua Carpatica minerala 0,500',
    cantitate: '0,500 ml',
    pretCost: 3.00,
    pretOffline: 7.00,
    pretOnline: 9.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-13',
    nume: 'Aqua Carpatica aroma 0,500',
    cantitate: '0,500 ml',
    pretCost: 4.50,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-14',
    nume: 'Compot (cu tot cu sticla si eticheta)',
    cantitate: 'buc',
    pretCost: 3.00,
    pretOffline: 7.00,
    pretOnline: 9.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-15',
    nume: 'Staropramen',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-16',
    nume: 'Bergenbier',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-17',
    nume: 'Becks',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-18',
    nume: 'Cidru Dacic (zmeura, capsuni)',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-19',
    nume: 'Cidru Dacic (afine, cherry)',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-20',
    nume: 'Ciuc',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 12.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-21',
    nume: 'Stella Artois',
    cantitate: 'buc',
    pretCost: 6.00,
    pretOffline: 12.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-22',
    nume: 'Stella Artois 0% alc.',
    cantitate: 'buc',
    pretCost: 6.00,
    pretOffline: 12.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-23',
    nume: 'Cidru Fresh lamaie si menta',
    cantitate: 'buc',
    pretCost: 5.00,
    pretOffline: 10.00,
    pretOnline: 14.00,
    category: 'bauturi',
    isActive: true
  },
  {
    id: 'bautura-24',
    nume: 'ROCKSTAR',
    cantitate: 'buc',
    pretCost: 4.00,
    pretOffline: 8.00,
    pretOnline: 10.00,
    category: 'bauturi',
    isActive: true
  }
];