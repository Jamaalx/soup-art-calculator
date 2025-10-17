import { MenuCalculation, Product } from '@/types';
import { MENU_COSTS } from '@/lib/data/constants';

/**
 * Calculate profit for OFFLINE menu (in-restaurant)
 * No packaging, no commission - just product costs
 */
export function calculateOfflineMenu(
  pretVanzare: number,
  products: Product[]
): MenuCalculation {
  // Sum product costs
  const costProduse = products.reduce((sum, p) => sum + p.pretCost, 0);
  
  // No packaging for offline
  const costAmbalaj = MENU_COSTS.OFFLINE.PACKAGING_PER_MENU;
  
  // No commission for offline
  const comisionPercentage = MENU_COSTS.OFFLINE.COMMISSION_PERCENTAGE;
  const comision = 0;
  
  // Total cost (just products)
  const costTotal = costProduse + costAmbalaj + comision;
  
  // Profit
  const profit = pretVanzare - costTotal;
  
  // Margin percentage
  const marjaProfit = (profit / costProduse) * 100;
  
  // Sum of individual OFFLINE prices (reference)
  const pretIndividual = products.reduce((sum, p) => sum + p.pretOffline, 0);
  
  // Customer savings
  const economie = pretIndividual - pretVanzare;
  
  // No validation needed for offline (more flexible pricing)
  const isValid = true;
  
  return {
    pretVanzare,
    costProduse,
    costAmbalaj,
    comision,
    comisionPercentage,
    costTotal,
    profit,
    marjaProfit,
    pretIndividual,
    economie,
    isValid
  };
}

/**
 * Calculate multiple simulations for all product combinations
 */
export function simulateOfflineMenus(
  pretVanzare: number,
  ciorbe: Product[],
  feluriPrincipale: Product[]
): MenuCalculation[] {
  const results: MenuCalculation[] = [];
  
  ciorbe.forEach(ciorba => {
    feluriPrincipale.forEach(felPrincipal => {
      const products = [ciorba, felPrincipal];
      const calc = calculateOfflineMenu(pretVanzare, products);
      results.push(calc);
    });
  });
  
  return results;
}